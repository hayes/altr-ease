var ease = require('ease-component')
  , raf = require('raf').polyfill

module.exports = ease_filter

function ease_filter(parts, change) {
  var fn = 'linear'
  , current = {}
  , target = {}
  , ms = 1
  , start
  , wait
  , prev

  var update_ms = this.create_part(parts[0], function(d) {
    ms = +d
    animate()
  })

  var update_fn = this.create_part(parts[1] || 'linear', function(d) {
    fn = d || 'linear'
    animate()
  })

  function animate() {
    if(wait) {
      return
    }

    wait = raf(function() {
      wait = null
      update()
    })
  }

  return function(d, ctx) {
    animate()
    prev = current
    target = JSON.parse(JSON.stringify(d))
    start = new Date
    update_ms(ctx)
    update_fn(ctx)
  }

  function update() {
    var diff = new Date - start
      , p = diff / ms

    if(p >= 1) {
      p = 1
    } else {
      animate()
    }

    p = ease[fn](p)

    current = update_part(prev, target, p)
    change(current)
  }

  function update_part(prev, target, p) {
    var result = target
      , keys

    if(typeof prev !== typeof target) {
      return result
    } else if(Array.isArray(target)) {
      result = Array(target.length)

      for(var i = 0, l = target.length; i < l; ++i) {
        result[i] = update_part(prev[i], target[i], p)
      }
    } else if(typeof target === 'object') {
      keys = Object.keys(target)
      result = {}

      for(var i = 0, l = keys.length; i < l; ++i) {
        result[keys[i]] = update_part(prev[keys[i]], target[keys[i]], p)
      }
    } else if(prev !== target && typeof target === 'number') {
      return prev + (target - prev) * p
    }

    return result
  }
}
