var express = require('express');
var app = express();
var debug = require('debug')('bowler-match');
var eventStore = require('./eventstore.js');
var eventProcessors = require('./eventProcessors.js');
var _ = require('underscore');

app.get('/', function(req, res) {
    debug('Request received with query params %s', JSON.stringify(req.query));

    var match = req.query.match;
    if(!match) {
        var error = 'matchId must be included in request query params';
        debug(error);
        return res.status(400).send(error);
    }

    var events = eventStore.getMatchEvents(match, function(error, events) {
        if(error) {
            debug(error);
            return res.status(500).send(error);
        }

        if(events.length == 0) {
            var message = 'No events for this match';
            debug(message);
            return res.status(404).send(message);
        }

        var stats = { innings: {} };

        _(events).each(function(e) {
            debug('Invoking processor for: %s', e.eventType);

            try {
                var increment = eventProcessors[e.eventType](e);
                incrementStats(stats, increment);
            } catch(error) {
                var message = 'Error trying to process events. ' + error;
                debug(message);
                return res.status(500).send(message);
            }
        });

        return res.send(stats);
    });
});

app.listen(3002);
console.log('score-processor listening on port 3002...');

incrementStats = function(stats, increment) {
    debug('Incrementing stats using: %s', JSON.stringify(increment));

    if(!stats.innings[increment.innings]) {
        stats.innings[increment.innings] = {};
        stats.innings[increment.innings].battingTeam = increment.battingTeam;
        stats.innings[increment.innings].wickets = 0;
        stats.innings[increment.innings].runs = 0;
    }

    var innings = stats.innings[increment.innings];

    if(increment.overs > innings.overs) innings.overs = increment.overs;
    if(increment.balls > innings.balls && increment.overs == innings.overs) innings.balls = increment.balls;

    if(increment.runs) innings.runs += increment.runs;
    if(increment.wickets) innings.wickets += increment.wickets;
};
