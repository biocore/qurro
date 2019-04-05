describe("Computing log ratios in ssmv.computeBalance()", function() {
    it("Computes the natural logarithm (i.e. using e as a base)", function() {
        // log(e / 1) = log(e) = 1
        // log(1 / e) = -log(e) = -1
        chai.assert.equal(ssmv.computeBalance(Math.E, 1), 1);
        chai.assert.equal(ssmv.computeBalance(1, Math.E), -1);
    });
    it("Returns NaN when numerator and/or denominator <= 0", function() {
        chai.assert.isNaN(ssmv.computeBalance(-2, 5));
        chai.assert.isNaN(ssmv.computeBalance(-2, -5));
        chai.assert.isNaN(ssmv.computeBalance(2, -5));
        chai.assert.isNaN(ssmv.computeBalance(3, 0));
        chai.assert.isNaN(ssmv.computeBalance(0, 3));
        chai.assert.isNaN(ssmv.computeBalance(0, 0));
    });
    var delta = 0.00001;
    it("Computes the correct log ratio given valid inputs", function() {
        chai.assert.approximately(ssmv.computeBalance(2, 5), -0.91629, delta);
        chai.assert.approximately(ssmv.computeBalance(5, 2), 0.91629, delta);
        chai.assert.approximately(ssmv.computeBalance(500, 400), 0.22314, delta);
        chai.assert.equal(ssmv.computeBalance(1.5, 0.5), Math.log(3));
        chai.assert.equal(ssmv.computeBalance(5, 5), 0);
        chai.assert.equal(ssmv.computeBalance(1, 1), 0);
        chai.assert.equal(ssmv.computeBalance(Math.E, Math.E), 0);
    });
    it("Throws an error when passed non-numerical input(s)", function() {
        // We need to wrap invocations in an anonymous function for Chai: see
        // https://stackoverflow.com/a/17793483
        chai.assert.throws(function() { ssmv.computeBalance('2', 5); });
        chai.assert.throws(function() { ssmv.computeBalance(2, '5'); });
        chai.assert.throws(function() { ssmv.computeBalance('3', '4'); });
        chai.assert.throws(function() { ssmv.computeBalance([1, 2]); });
    });
    it("Throws an error when passed < 2 arguments", function() {
        chai.assert.throws(function() { ssmv.computeBalance(3); });
        chai.assert.throws(function() { ssmv.computeBalance(); });
        chai.assert.throws(function() { ssmv.computeBalance([1, 2]); });
    });
});

//describe("Computing balance for a given sample", function() {
//    it("Computes balance of two features for one sample", function() );
//});
