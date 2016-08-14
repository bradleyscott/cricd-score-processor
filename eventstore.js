var debug = require('debug')('score-processor-eventstore');
var client = require('ges-client');
var _ = require('underscore');
var exports = module.exports = {};

// Configuration variables
var host = process.env.EVENTSTORE_HOST ? process.env.EVENTSTORE_HOST : 'eventstore';
var port = process.env.EVENTSTORE_PORT ? process.env.EVENTSTORE_PORT : 1113;
var user = process.env.EVENTSTORE_USER ? process.env.EVENTSTORE_USER : 'admin';
var password = process.env.EVENTSTORE_PASSWORD ? process.env.EVENTSTORE_PASSWORD : 'changeit';

exports.getMatchEvents = function(matchId, callback) {
    if(!matchId) {
        var error = 'matchId is required to get EventStore events';
        debug(error);
        callback(error);
        return;
    }

    var stream = 'cricd-match-' + matchId;
    var settings = {
        host: host,
        port: port
    };
    debug('Getting match events from EventStore. %s', JSON.stringify(settings));

    var connection = client(settings);
    connection.on('connect', function() {
        var auth = {
            username: user,
            password: password
        };
        debug('EventStore connection established. Reading stream with credentials %s', JSON.stringify(auth));

        connection.readStreamEventsForward(stream, {
            start: 0,
            count: 4096, // TODO: Make this dynamic
            auth: auth,
            resolveLinkTos: true
        }, function(err, readResult) {
            if(err) {
                var error = 'Problem reading from EventStore stream: ' + stream + '. ' + err;
                callback(error);
            }

            debug('Retrieved %s match events', readResult.Events.length);
            var events = _(readResult.Events).map(function(e) {
                var json = e.Event.Data.toString();
                return JSON.parse(json);
            });
            callback(null, events);
        });
    });
};
