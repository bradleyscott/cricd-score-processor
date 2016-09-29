var express = require('express');
var app = express();
var debug = require('debug')('bowler-match');
var Promise = require('bluebird');
var eventStore = Promise.promisifyAll(require('./eventstore.js'));
var entities = Promise.promisifyAll(require('./entities.js'));
var eventProcessors = require('./eventProcessors.js');
var _ = require('underscore');

app.use(function(req, res, next) {
    var allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS : 'http://localhost:8080';
    res.header("Access-Control-Allow-Origin", allowedOrigins);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    debug('Request received with query params %s', JSON.stringify(req.query));

    var match = req.query.match;
    if(!match) {
        var error = 'matchId must be included in request query params';
        debug(error);
        return res.status(400).send(error);
    }

    var matchInfo = {};
    entities.getMatchInfoAsync(match).then(function(info) {
        matchInfo = info;
        return eventStore.getMatchEventsAsync(match);
    }).then(function(events) {
        if(events.length == 0) {
            var message = 'No events for this match';
            debug(message);
            return res.status(404).send(message);
        }

        var stats = { innings: {}, matchEvents: [] };

        _(events).each(function(e) {
            debug('Invoking processor for: %s', e.eventType);

            try {
                var increment = eventProcessors[e.eventType](e);
                eventProcessors.incrementStats(stats, increment);
                stats.matchEvents.push(e);
            } catch(error) {
                var message = 'Error trying to process events. ' + error;
                debug(message);
                return res.status(500).send(message);
            }
        });

        eventProcessors.calculateResult(stats, matchInfo);
        stats.matchInfo = matchInfo;
        return res.send(stats);
    }).catch(function(error) {
        debug(error);
        return res.status(500).send(error);
    });
});

app.listen(3002);
console.log('score-processor listening on port 3002...');
