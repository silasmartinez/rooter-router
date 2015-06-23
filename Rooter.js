var url = require('url')

var Rooter = function () {
  this.routeHandlers = {}
}

Rooter.prototype.add = function (routeUrl, routeResponse) {
  this.routeHandlers[routeUrl] = routeResponse
}

Rooter.prototype.handle = function (req, res) {
  if (req.url === '/favicon.ico') return
  console.log(req.url)
  var routeArray = []
  helper = url.parse(req.url)
  helper.resource = helper.pathname.split('/')[1]
  helper.id = helper.pathname.split('/')[2]
  helper.verb = req.method

  if (req.url[req.url.length - 1] === '/') {
    routeArray = req.url.slice(0, -1).split('/')
  } else {
    routeArray = req.url.split('/')
  }

  if (routeArray.length === 2) {
    this.routeHandlers[routeArray.join('/')](req, res, helper)
  } else if (routeArray.length === 3) {
    if (routeArray[2] === 'new') {
      this.routeHandlers[routeArray.join('/')](req, res, helper)
    } else {
      routeArray[2] = ':id'
      this.routeHandlers[routeArray.join('/')](req, res, helper)
    }
  } else if (routeArray.length === 4 && routeArray[3] === 'edit') {
    routeArray[2] = ':id'
    this.routeHandlers[routeArray.join('/')](req, res, helper)
  } else {
    res.end("Couldn't find an appropriate route")
  }
}

module.exports = Rooter
