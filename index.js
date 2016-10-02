var express = require('express');
var app = express();
var debug = require('debug')('score-processor');
var Promise = require('bluebird');
var cors = require('cors');
var async = require('async');
var eventStore = Promise.promisifyAll(require('./eventstore.js'));
var entities = Promise.promisifyAll(require('./entities.js'));
var eventProcessors = require('./eventProcessors.js');
var resultCalculator = require('./resultCalculator.js');
var battingAndBowling = Promise.promisifyAll(require('./battingAndBowling.js'));
var _ = require('underscore');

var allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS : 'http://localhost:8080';
var corsOptions = {
    origin: allowedOrigins
};

app.get('/', cors(corsOptions), function(req, res) {
    debug('Request received with query params %s', JSON.stringify(req.query));

    var match = req.query.match;
    if(!match) {
        var error = 'matchId must be included in request query params';
        debug(error);
        return res.status(400).send(error);
    }

    var stats = { innings: [], matchEvents: [] };
    eventStore.getMatchEventsAsync(match).then(function(events) {
        if(events.length == 0) {
            var message = 'No events for this match';
            debug(message);
            return res.send();
        }

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

        return entities.getMatchInfoAsync(match);
    }).then(function(info) {
        resultCalculator.calculateResult(stats, info);
        stats.matchInfo = info;

        async.parallel([
            function(callback) { battingAndBowling.addBowlingStats(stats, match, callback); },
            function(callback) { battingAndBowling.addBattingStats(stats, match, callback); }
        ],
            function(err) { 
                debug(err);
                if(err) res.status(500).send(err);
                return res.send(stats); 
            });
    }).catch(function(error) {
        debug(error);
        return res.status(500).send(error);
    });
});

app.listen(3002);
console.log('score-processor listening on port 3002...');
