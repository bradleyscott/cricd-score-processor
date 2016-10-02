var debug = require('debug')('score-processor:entities');
var exports = module.exports = {};
var Client = require('node-rest-client').Client;
var client = new Client();

// Configuration variables
var host = process.env.ENTITIES_HOST ? process.env.ENTITIES_HOST : 'entities';
var port = process.env.ENTITIES_PORT ? process.env.ENTITIES_PORT : 1337;

exports.getMatchInfo = function(matchId, callback) {
    debug('Attempting to retrieve match info');

    if(!matchId) {
        var error = 'matchId is required to get info';
        debug(error);
        return callback(error);
    }
 
    var baseUrl = 'http://' + host + ':' + port; 
    client.get(baseUrl + '/matches/' + matchId, function (info, response) {
        debug('Received match info: %s', JSON.stringify(info));
        callback(null, info);
    }).on('error', function (err) {
        var message = 'Problem retrieving match info: ' + err;
        debug(message);
        return callback(message);
    });
};