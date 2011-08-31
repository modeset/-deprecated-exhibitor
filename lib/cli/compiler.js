
// ## Compiler
// **File: lib/cli/compiler.js**

// ...

// Module dependency
var fs = require('fs')
var path = require('path')

var Compiler = module.exports = function Compiler(lexer, globalops, sectionops) {
  this.lexer = lexer
  this.globalops = globalops || null
  this.sectionops = sectionops || null
  this.slides = []
}

// this is begging for a refactor
Compiler.prototype.compile = function(html) {
  var buff = html.split('\n')
  var slide = {master: null, html: null}
  var section = ''

  for (var i = 0, len = buff.length; i < len; i += 1) {
    var line = buff[i]

    // If this is a <!-- SECTION... strip it out so we can inherit the sections settings
    if (line.match(this.lexer.section)) {
      section = line.replace(this.lexer.stripsect, '')

    // else if this is a <!-- SLIDE... parse it's data and add a new data object for it
    } else if (line.match(this.lexer.options)) {
      slide = this.compileOptions(line, section)
      this.slides.push(slide)

    // Otherwise add it to it's current `slide.html` object
    } else {
      slide.html += line
    }
  }
  return this.slides
}

Compiler.prototype.compileOptions = function(str, section) {
  var stripped = str.replace(this.lexer.comment, '')
  var space_index = stripped.search(this.lexer.firstspace)
  var o = {master: null, html: ''}
  var options = null

  if (space_index < 0) {
    o.master = stripped.substr(space_index + 1)
  } else {
    o.master = stripped.substring(0, space_index)
    options = stripped.substr(space_index + 1)
    this.compileExtras(options, section)
  }

  if (options) {
    var ops = this.compileExtras(options, section)

    for (var prop in ops) {
      o[prop] = ops[prop]
    }
  }
  o = this.inherit(o, this.sectionops[section])
  o = this.inherit(o, this.globalops)
  return o
}

// Turn a string into an object
Compiler.prototype.compileExtras = function(str) {
  var self = this
  var o = {}
  var ops = str.replace(this.lexer.brackets, '').replace(this.lexer.colons, ':').replace(this.lexer.commas, ',')
  var settings = ops.split(',')

  settings.forEach(function (item) {
    var keyvals = item.split(':')
    o[keyvals[0]] = keyvals[1]
  })
  return o
}

Compiler.prototype.inherit = function(o, ops) {
  for (var prop in ops) {
    if (!this.hasKey(prop, o)) {
      o[prop] = ops[prop]
    }
  }
  return o
}

Compiler.prototype.hasKey = function(key, obj) {
  for (var _key in obj) {
    if (_key === key) {
      return true
    }
  }
    return false
}

