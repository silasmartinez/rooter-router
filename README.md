# rooter-router

This is a basic javascript router implementation. It doesn't do regex, and it is strongly biased toward specificity - routes are matched to their most specific match.

It handles multiple levels of resources and dynamic segments, and can handle method-specific routes.

NOTE: If you elect to use method specific routers, you cannot also use general routes for that endpoint.

Splats: Rooter-router has a basic splats implementation. Note that splats are always treated as less specific, which has the following repercussions:

Given:
```
testRouter.add('/public/*', function (req, res, helper) {
      res.end(helper.routeMatched)
    })
  .add('/public/resource/:test', function (req, res, helper) {
      res.end(helper.dynamics.test)
    })
```

the test:

```
request(app)
      .get('/public/resource/foobar')
      .expect('foobar’)
```

passes. In addition, a less specific splat will not overrule a more specific splat. Hence:

```
testRouter.add('/public/*', function (req, res, helper) {
      res.end(helper.routeMatched)
    })
  .add('/public/special/*', function (req, res, helper) {
      res.end(helper.dynamics.test)
    })
```
with a test of:
```
request(app)
      .get('/public/special/foo/bar/baz')
      .expect('/public/special/*’)
```
will also pass. Note that the route definitions above use method chaining, which is supported when adding routes.

Usage looks something like this:

```
var http = require('http'),
Rooter = require('rooter-router')

router = new Rooter

router.add('/foo', function(req, res, url){
    res.end('Index for ' + url.resources[0])
})
router.add('/foo/:id', function(req, res, url){
  res.end('Got an instance of a foo: ' + url.dynamics.id)
})
router.add('/foo/new', function(req, res, url){
  res.end('This must have been a get request')
},'GET')
router.add('/foo/:bar/baz', function(req, res, url){
  res.end( url.resources[0] + '/' + url.dynamics.bar + '/' + url.resources[1])
})

http.createServer(function (req, res) {
  router.handle(req, res)
}).listen(9001)
```

Note that the URL object available to your callback includes a standard url.parse object, in addition to elements such as:
* resources (an array)
* dynamics (an object, where the key name is the dynamic segment)
* verb (method)
* matchedRoute

Testing (jasmine) requires supertest (for testing only). Tests cover essential functions, and are visible at specs/rooterSpec.js
