var debug = require('debug')('score-processor:battingAndBowling');
var _ = require('underscore');
var exports = module.exports = {};
var Client = require('node-rest-client').Client;
var client = new Client();
var async = require('async');

// Configuration variables
var host = process.env.BATTINGPROCESSOR_HOST ? process.env.BATTINGPROCESSOR_HOST : 'batting-processor';
var port = process.env.BATTINGPROCESSOR_PORT ? process.env.BATTINGPROCESSOR_PORT : 3000;

exports.addBattingStats = function(stats, matchId, callback) {
    debug('Attempting to add batting stats');

    async.forEachOf(stats.innings, function(i, key, cb) {
        getBattingStats(matchId, key + 1, function(err, batting) {
            if(err) cb(err);
            stats.innings[key].batting = batting;
            cb();
        });
    }, function(err) {
        if(err) {
            debug(err);
            return callback(err);
        }

        debug('Successfully adding batting stats');
        callback();
    });
}

exports.getBattingStats = function(matchId, inningsId, callback) {
    debug('Attempting to retrieve batting stats');

    if(!matchId || !inningsId) {
        var error = 'matchId and inningsId is required to get info';
        debug(error);
        return callback(error);
    }

    var baseUrl = 'http://' + host + ':' + port;
    client.get(baseUrl + '?match=' + matchId + '&innings=' + inningsId, function(info, response) {
        debug('Received match info: %s', JSON.stringify(info));
        callback(null, info);
    }).on('error', function(err) {
        var message = 'Problem retrieving batting info: ' + err;
        debug(message);
        return callback(message);
    });
};
var getBattingStats = exports.getBattingStats;