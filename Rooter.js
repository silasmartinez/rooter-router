var url = require('url')

var Rooter = function () {
  this.routeHandlers = {}
  this.matchObjs = []
}

Rooter.prototype.add = function (routeUrl, routeResponse, routeMethod) {
  if (routeMethod) {
    if (this.routeHandlers.hasOwnProperty(routeUrl)) {
      throw new Error('Cannot assign a method specific route if a general route exists')
    }
    var baseRoute = routeUrl
    routeUrl = routeMethod + routeUrl
    this.routeHandlers[routeUrl] = {}
    this.routeHandlers[routeUrl].method = routeMethod
    this.routeHandlers[routeUrl].baseRoute = baseRoute
  } else {
    for (route in this.routeHandlers) {
      if (this.routeHandlers[route].baseRoute === routeUrl) {
        throw new Error('Cannot assign a general route if a method specific route exists')
      }
    }
    this.routeHandlers[routeUrl] = {}
  }
  this.routeHandlers[routeUrl].func = routeResponse
  var dynamicCheck = []
  routeUrl.split('/').forEach(function (member, index) {
    if (member[0] === ':') {
      if (dynamicCheck.indexOf(member) < 0) {
        dynamicCheck.push(member)
      } else {
        throw new Error('route {' + routeUrl + '} contains duplicate dynamic segment {' + member + '}')
      }
    }
  })
  this.routeHandlers[routeUrl].hasLength = routeUrl.split('/').length
  return this
}

Rooter.prototype.getBestMatch = function (reqUrlArray, reqMethod) {
  var matches = []
  for (route in this.routeHandlers) {
    var matchObj = {
      'namedRoute': route,
      'matchRate': reqUrlArray.length
    }

    if (reqUrlArray.length === parseInt(this.routeHandlers[route].hasLength) && ( this.routeHandlers[route].method === reqMethod || !this.routeHandlers[route].method)) {

      var routeArray = route.split('/')
      var isMatch = true
      reqUrlArray.forEach(function (ele, ind) {
        if (ind > 0) {
          if (routeArray[ind][0] === ':') {
            matchObj.matchRate += 1
          } else if (ele === routeArray[ind]) {
            matchObj.matchRate += 2
          } else {
            isMatch = false
          }
        }
      })
      if (isMatch) {
        matches.push(matchObj)
      }
    }
  }

  if (matches.length > 0) {
    return matches.reduce(function (a, cur) {
      return a.matchRate > cur.matchRate ? a : cur
    })
  } else {
    return false
  }
}

Rooter.prototype.handle = function (req, res) {
  var path = url.parse(req.url).pathname
  var reqUrlArray = []
  var helper = url.parse(req.url)

  helper.resources = []
  helper.dynamics = {}
  helper.verb = req.method

  if (path[path.length - 1] === '/') {
    path = path.slice(0, -1)
  }
  reqUrlArray = path.split('/')

  var chosenRoute = this.getBestMatch(reqUrlArray, req.method).namedRoute

  if (chosenRoute) {
    var routeArray = chosenRoute.split('/')
    reqUrlArray.forEach(function (ele, ind) {
      if (ind > 0) {
        if (routeArray[ind][0] === ':') {
          helper.dynamics[routeArray[ind].substring(1)] = ele
        } else if (ele === routeArray[ind]) {
          helper.resources.push(ele)
        } else {
          isMatch = false
        }
      }
    })

    helper.routeMatched = chosenRoute
    this.routeHandlers[route].func(req, res, helper)
    return

  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'})
    res.write('404: Resource not found\n')
    res.write(path + ' (' + req.method + ')')
    res.end()
  }
}

module.exports = Rooter
