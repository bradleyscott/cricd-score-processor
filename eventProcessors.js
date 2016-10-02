var debug = require('debug')('score-processor:eventProcessors');
var _ = require('underscore');
var exports = module.exports = {};

exports.incrementStats = function(stats, increment) {
    debug('Incrementing stats using: %s', JSON.stringify(increment));

    var inningsNumber = increment.innings - 1;
    if(!stats.innings[inningsNumber]) {
        stats.innings[inningsNumber] = {};
        stats.innings[inningsNumber].over = 0;
        stats.innings[inningsNumber].ball = 0;
        stats.innings[inningsNumber].battingTeam = increment.battingTeam;
        stats.innings[inningsNumber].wickets = 0;
        stats.innings[inningsNumber].runs = 0;
    }

    var innings = stats.innings[inningsNumber];

    if(increment.over > innings.over) { // New over has begun
        innings.over = increment.over;
        innings.ball = 0;
    }
    innings.ball += increment.ball; // Increment ball on legal delivery

    if(innings.ball == 6) { // At end of over make the ball count 0
        innings.over += 1;
        innings.ball = 0;
    }

    if(increment.runs) innings.runs += increment.runs;
    if(increment.wickets) innings.wickets += increment.wickets;
};

exports.delivery = function(e) {
    debug('Processing delivery: %s', JSON.stringify(e));
    var increment = {};

    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    e.runs ? increment.runs = parseInt(e.runs) : increment.runs = 0;

    return increment;
};

exports.noBall = function(e) {
    debug('Processing noBall: %s', JSON.stringify(e));
    var increment = {};

    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 0;
    e.runs ? increment.runs = parseInt(e.runs) + 1 : increment.runs = 1;

    return increment;
};

exports.wide = function(e) {
    debug('Processing wide: %s', JSON.stringify(e));
    var increment = {};

    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 0;
    e.runs ? increment.runs = parseInt(e.runs) + 1 : increment.runs = 1;

    return increment;
};

exports.bye = function(e) {
    debug('Processing bye: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    e.runs ? increment.runs = parseInt(e.runs) : increment.runs = 0;

    return increment;
};

exports.legBye = function(e) {
    debug('Processing legBye: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    e.runs ? increment.runs = parseInt(e.runs) : increment.runs = 0;
    increment.event = e;

    return increment;
};

exports.bowled = function(e) {
    debug('Processing bowled: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = 0;
    increment.wickets = 1;

    return increment;
};

exports.timedOut = function(e) {
    debug('Processing timedOut: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 0;
    increment.runs = 0;
    increment.wickets = 1;

    return increment;
};

exports.caught = function(e) {
    debug('Processing caught: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = 0;
    increment.wickets = 1;


    return increment;
};

exports.handledBall = function(e) {
    debug('Processing handledBall: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.wickets = 1;
    increment.runs = 0;

    return increment;
};

exports.doubleHit = function(e) {
    debug('Processing doubleHit: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = 0;
    increment.wickets = 1;

    return increment;
};


exports.hitWicket = function(e) {
    debug('Processing hitWicket: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = 0;
    increment.wickets = 1;

    return increment;
};

exports.lbw = function(e) {
    debug('Processing lbw: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = 0;
    increment.wickets = 1;

    return increment;
};

exports.obstruction = function(e) {
    debug('Processing obstruction: %s', JSON.stringify(e));
    var increment = {};
    
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = parseInt(e.runs);
    increment.wickets = 1;
    return increment;
};

exports.runOut = function(e) {
    debug('Processing runOut: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = parseInt(e.runs); // TODO: Run outs can happen on wides and no-ball
    increment.wickets = 1;

    return increment;
};

exports.stumped = function(e) {
    debug('Processing stumped: %s', JSON.stringify(e));
    var increment = {};
    increment.innings = e.ball.innings;
    increment.battingTeam = e.ball.battingTeam;
    increment.over = e.ball.over;
    increment.ball = 1;
    increment.runs = 0;
    increment.wickets = 1;

    return increment;
};
