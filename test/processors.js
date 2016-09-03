var assert = require('assert');
var processor = require('../eventProcessors.js');
var should = require('should');

var getEvent = function() {
    return {
        ball: {
            innings: 1,
            over: 1
        }
    };
};

describe('A dot ball', function() {
    var e = getEvent();
    e.runs = 0;
    var increment = processor.delivery(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should not increment the wickets count', function() {
        if(increment.wickets) increment.wickets.should.equal(0);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('A single', function() {
    var e = getEvent();
    e.runs = 1;
    var increment = processor.delivery(e);

    it('should increment the batting teams score by 1', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(1);
    });

    it('should not increment the wickets count', function() {
        if(increment.wickets) increment.wickets.should.equal(0);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('A no ball', function() {
    describe('where no runs are taken', function() {
        var e = getEvent();
        e.runs = 0;
        var increment = processor.noBall(e);

        it('should increment the batting teams score by 1', function() {
            increment.should.have.property('runs');
            increment.runs.should.equal(1);
        });

        it('should not increment the wickets count', function() {
            if(increment.wickets) increment.wickets.should.equal(0);
        });

        it('should not be counted as a legal delivery', function() {
            increment.should.have.property('ball');
            increment.ball.should.equal(0);
        });
    });

    describe('where 1 run is taken', function() {
        var e = getEvent();
        e.runs = 1;
        var increment = processor.noBall(e);

        it('should increment the batting teams score by 2', function() {
            increment.should.have.property('runs');
            increment.runs.should.equal(2);
        });

        it('should not increment the wickets count', function() {
            if(increment.wickets) increment.wickets.should.equal(0);
        });

        it('should not be counted as a legal delivery', function() {
            increment.should.have.property('ball');
            increment.ball.should.equal(0);
        });
    });
});

describe('Two byes', function() {
    var e = getEvent();
    e.runs = 2;
    var increment = processor.bye(e);

    it('should increment the batting teams score by 2', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(2);
    });

    it('should not increment the wickets count', function() {
        if(increment.wickets) increment.wickets.should.equal(0);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Two leg byes', function() {
    var e = getEvent();
    e.runs = 2;
    var increment = processor.bye(e);

    it('should increment the batting teams score by 2', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(2);
    });

    it('should not increment the wickets count', function() {
        if(increment.wickets) increment.wickets.should.equal(0);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Bowled', function() {
    var e = getEvent();
    var increment = processor.bowled(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Timed out', function() {
    var e = getEvent();
    var increment = processor.timedOut(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should not be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(0);
    });
});

describe('Caught', function() {
    var e = getEvent();
    var increment = processor.caught(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Handled ball', function() {
    var e = getEvent();
    var increment = processor.handledBall(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Double hit', function() {
    var e = getEvent();
    var increment = processor.doubleHit(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Hit wicket', function() {
    var e = getEvent();
    var increment = processor.hitWicket(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});


describe('LBW', function() {
    var e = getEvent();
    var increment = processor.lbw(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Stumped', function() {
    var e = getEvent();
    var increment = processor.stumped(e);

    it('should not increment the batting teams score', function() {
        increment.should.have.property('runs');
        increment.runs.should.equal(0);
    });

    it('should increment the wickets count by 1', function() {
        increment.should.have.property('wickets');
        increment.wickets.should.equal(1);
    });

    it('should be counted as a legal delivery', function() {
        increment.should.have.property('ball');
        increment.ball.should.equal(1);
    });
});

describe('Obstruction', function() {
    describe('where no runs are taken', function() {
        var e = getEvent();
        e.runs = 0;
        var increment = processor.obstruction(e);

        it('should not increment the batting teams score', function() {
            increment.should.have.property('runs');
            increment.runs.should.equal(0);
        });

        it('should increment the wickets count by 1', function() {
            increment.should.have.property('wickets');
            increment.wickets.should.equal(1);
        });

        it('should be counted as a legal delivery', function() {
            increment.should.have.property('ball');
            increment.ball.should.equal(1);
        });
    });
    describe('where one run is taken', function() {
        var e = getEvent();
        e.runs = 1;
        var increment = processor.obstruction(e);

        it('should  increment the batting teams score by 1', function() {
            increment.should.have.property('runs');
            increment.runs.should.equal(1);
        });

        it('should increment the wickets count by 1', function() {
            increment.should.have.property('wickets');
            increment.wickets.should.equal(1);
        });

        it('should be counted as a legal delivery', function() {
            increment.should.have.property('ball');
            increment.ball.should.equal(1);
        });
    });
});