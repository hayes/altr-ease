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
    if(typeof prev !== typeof target) {
      return target
    } else if(Array.isArray(target)) {
      return target.map(function(v, i) {
        return update_part(prev[i], v, p)
      })
    } else if(typeof target === 'object') {
      return Object.keys(target).reduce(function(val, key) {
        val[key] = update_part(prev[key], target[key], p)

        return val
      }, {})
    } else if(prev === target) {
      return target
    } else if(typeof target === 'number') {
      return prev + (target - prev) * p
    }

    return target
  }
}
