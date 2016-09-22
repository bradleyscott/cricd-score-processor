var debug = require('debug')('score-processor-eventProcessors');
var _ = require('underscore');
var exports = module.exports = {};

exports.calculateResult = function(score, matchInfo) {
    debug('Calculating match result...');

    var teamOneRuns = 0, teamTwoRuns = 0;
    if(score.innings[1]) teamOneRuns += score.innings[1].runs;
    if(score.innings[3]) teamOneRuns += score.innings[3].runs;
    if(score.innings[2]) teamTwoRuns += score.innings[2].runs;
    if(score.innings[4]) teamTwoRuns += score.innings[4].runs;

    var result = {};
    var teamTwoLeads = teamTwoRuns > teamOneRuns;
    var complete = isMatchComplete(score, matchInfo, teamTwoLeads);
    var difference = Math.abs(teamOneRuns - teamTwoRuns);

    if(teamOneRuns > teamTwoRuns) {
        result.team = score.innings[1].battingTeam;
        if(complete) result.result = 'won by ' + difference + ' runs';
        else result.result = 'leads by ' + difference + ' runs';
    }
    else if(difference == 0 && complete) result.result = 'Match was drawn';
    else if(difference == 0 && !complete) result.result = 'Scores are tied';
    else {
        result.team = score.innings[2].battingTeam;
        var wicketsLeft = 10 - score.innings[matchInfo.numberOfInnings * 2].wickets; 
        
        if(complete) result.result = 'won by ' + wicketsLeft + ' wickets';
        else result.result = 'leads by ' + difference + ' runs';
    } 

    score.result = result;
};

exports.isMatchComplete = function(score, matchInfo, teamTwoLeads) {
    if(!score.innings[2]) return false;
    else if(matchInfo.numberOfInnings == 2 && !score.innings[4]) return false;
    else if(matchInfo.numberOfInnings == 1 && isInningsComplete(score.innings[2])) return true;
    else if(matchInfo.numberOfInnings == 2 && isInningsComplete(score.innings[4])) return true;
    else if(matchInfo.numberOfInnings == 1 && teamTwoLeads) return true;
    else if(matchInfo.numberOfInnings == 2 && score.innings[4] && teamTwoLeads) return true;
    else return false;
};
var isMatchComplete = exports.isMatchComplete;

exports.isInningsComplete = function(innings, limitedOvers) {
    if(innings.wickets == 10) return true;
    else if(innings.over >= limitedOvers) return true;
    else return false;
};
var isInningsComplete = exports.isInningsComplete;

exports.incrementStats = function(stats, increment) {
    debug('Incrementing stats using: %s', JSON.stringify(increment));

    if(!stats.innings[increment.innings]) {
        stats.innings[increment.innings] = {};
        stats.innings[increment.innings].over = 0;
        stats.innings[increment.innings].ball = 0;
        stats.innings[increment.innings].battingTeam = increment.battingTeam;
        stats.innings[increment.innings].wickets = 0;
        stats.innings[increment.innings].runs = 0;
    }

    var innings = stats.innings[increment.innings];

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
