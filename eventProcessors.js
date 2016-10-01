var debug = require('debug')('score-processor-eventProcessors');
var _ = require('underscore');
var exports = module.exports = {};

exports.calculateResult = function(score, matchInfo) {
    debug('Calculating match result...');

    // Identify th teams
    var homeTeamId = matchInfo.homeTeam.id;
    var awayTeamId = matchInfo.awayTeam.id;

    // Calculate the runs scored by each team
    var homeTeamRuns = 0, awayTeamRuns = 0;
    for(var i = 0; i < score.innings.length; i++) {
        if(score.innings[i].battingTeam.id == homeTeamId)
            homeTeamRuns += score.innings[i].runs;
        else awayTeamRuns += score.innings[i].runs;
    }

    // Identify the teams batting first and second
    var battingFirstRuns, battingSecondRuns;
    if(score.innings[1].battingTeam.id == homeTeamId) {
        battingFirstRuns = homeTeamRuns;
        battingSecondRuns = awayTeamRuns;
    } else {
        battingFirstRuns = awayTeamRuns;
        battingSecondRuns = homeTeamRuns;
    }

    // Determine result
    var result = {};
    var isTeamBattingSecondAhead = battingSecondRuns > battingFirstRuns;
    var isComplete = isMatchComplete(score, matchInfo, isTeamBattingSecondAhead);
    var difference = Math.abs(battingFirstRuns - battingSecondRuns);

    if(battingFirstRuns > battingSecondRuns) { // Team batting first wins
        result.team = score.innings[1].battingTeam;
        if(isComplete) result.result = 'won by ' + difference + ' runs';
        else result.result = 'leads by ' + difference + ' runs';
    }
    else if(difference == 0 && isComplete) result.result = 'Match was drawn';
    else if(difference == 0 && !isComplete) result.result = 'Scores are tied';
    else { // Team batting second wins
        result.team = score.innings[2].battingTeam;
        var wicketsLeft = 10 - score.innings[matchInfo.numberOfInnings * 2].wickets; 
        
        if(isComplete) result.result = 'won by ' + wicketsLeft + ' wickets';
        else result.result = 'leads by ' + difference + ' runs';
    } 

    score.result = result;
};

exports.isMatchComplete = function(score, matchInfo, isTeamBattingSecondAhead) {
    var isFollowOn = matchInfo.numberOfInnings == 2 && (score.innings[1] && score.innings[2]) && (score.innings[1].battingTeam.id == score.innings[2].battingTeam.id);

    if(!score.innings[1]) return false; // No match can be complete without the 2nd team batting
    else if(matchInfo.numberOfInnings == 1 && isInningsComplete(score.innings[1])) return true; // 2 innings complete when 1 innings each
    else if(matchInfo.numberOfInnings == 2 && isInningsComplete(score.innings[3])) return true; // 4 innings complete when 2 innings each
    else if(matchInfo.numberOfInnings == 1 && isTeamBattingSecondAhead) return true; // Team batting second is ahead in 1 innings match
    else if(matchInfo.numberOfInnings == 2 && score.innings[3] && isTeamBattingSecondAhead) return true;  // Team batting second is ahead in 4th innings
    else if(isFollowOn && isInningsComplete[2] && !isTeamBattingSecondAhead) return true; // Follow on enforced and 2nd team dismissed without lead
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
