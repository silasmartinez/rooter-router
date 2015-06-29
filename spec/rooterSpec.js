var Rooter = require('../Rooter')
var http = require('http')
var request = require('supertest')

var testRouter = new Rooter

var testServer = http.createServer(function (req, res) {
  testRouter.handle(req, res)
})

var app = testServer


describe('#add()', function () {
  it('should add a route to routeHandlers', function () {
    testRouter.add('/things', function (req, res) {res.end('success')})
    expect( testRouter.routeHandlers['/things'].func.toString() )
      .toEqual(function (req, res) {res.end('success')}.toString())
  })
  it("should throw when trying to add a method specific route when a general exists", function () {
    expect(function () {
      testRouter.add('/things', function () {},'POST')
    }).toThrow(
      new Error('Cannot assign a method specific route if a general route exists')
    )
  });
})

describe("#handle()", function () {
  it("should 404 for an unknown route", function (done) {
    request(app)
      .get('/thisroutedoesnotexist')
      .expect(404)
      .end(function(err, res) {
        if (err) {
          done.fail(err)
        } else {
          done()
        }
      })
  });
  it("should handle a defined route", function (done) {
    request(app)
      .get('/things')
      .expect('success')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done.fail(err)
        } else {
          done()
        }
      })
  });
  it("should generate a helper object", function (done) {
    testRouter.add('/helptest', function (req, res, helper) {
      res.end(helper.resources[0])
    })
    request(app)
      .get('/helptest')
      .expect('helptest')
      .end(function(err, res) {
        if (err) {
          done.fail(err)
        } else {
          done()
        }
      })
  });
  it("should prefer a more specific route", function (done) {
    testRouter.add('/foo/:bar', function (req, res, helper) {
      res.end(helper.routeMatched)
    })
      .add('/foo/baz', function (req, res, helper) {
      res.end(helper.routeMatched)
    })
    request(app)
      .get('/foo/baz')
      .expect('/foo/baz')
      .end(function(err, res) {
        if (err) {
          done.fail(err)
        } else {
          done()
        }
      })
  });
  it("should handle multiple dynamic segments", function (done) {
    testRouter.add('/foo/:bar/baz/:fa', function (req, res, helper) {
      res.end(helper.dynamics.bar + helper.dynamics.fa)
    })
    request(app)
      .get('/foo/stuff/baz/nthings')
      .expect('stuffnthings')
      .end(function(err, res) {
        if (err) {
          done.fail(err)
        } else {
          done()
        }
      })
  });
});