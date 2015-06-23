# rooter-router

This is a super simple javascript router implementation. Currently, it only handles the first level of resources (will not handle child resources)

Usage looks something like this:

```
var http = require('http'),
Rooter = require('rooter-router')

router = new Rooter

router.add('/foo', function(req, res, url){
    res.end('some index')
})
router.add('/foo/:id', function(req, res, url){
  res.end('Got an instance of a foo: ' + url.id)
})
router.add('/foo/new', function(req, res, url){
  res.end('Create a foo?')
})
router.add('/foo/:id/edit', function(req, res, url){
  res.end('Editing ' + url.resource + ' ' + url.id)
})

http.createServer(function (req, res) {
  router.handle(req, res)
}).listen(9001)
```

Note that the URL object available to your callback includes a standard url.parse object, in addition to elements such as resource, id, and verb (method)