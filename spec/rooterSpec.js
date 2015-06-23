var Rooter = require('../Rooter')

var testRouter = new Rooter

describe('#add()', function () {
  it('should add a route to routeHandlers', function () {

    testRouter.add('/things', function () {})

    expect( testRouter.routeHandlers.things.toString() )
      .toEqual(function () {}.toString())

  })
})

describe("#handle()", function () {
  xit("should generate a helper object", function () {
  });
  xit("should handle a request", function () {
  });
});