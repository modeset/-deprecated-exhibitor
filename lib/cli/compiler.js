
// ## Compiler
// **File: lib/cli/compiler.js**

// Compiles an html string into an object of key value pairs, ready to be converted to json

// Module dependency
var fs = require('fs')
var path = require('path')

// Instantiate with a reference to the lexer, global and section options
var Compiler = module.exports = function Compiler(lexer, globalops, sectionops) {
  this.lexer = lexer
  this.globalops = globalops || null
  this.sectionops = sectionops || null
  this.slides = []
}

// Compiles the html string into key/value pairs with configuration options
// NOTE: This is begging for a bit of a refactor
Compiler.prototype.compile = function(html) {
  var buff = html.split('\n')
  var slide = {master: null, html: null}
  var section = ''

  // Look at each line within a buffer..
  for (var i = 0, len = buff.length; i < len; i += 1) {
    var line = buff[i]

    // If this is a <!-- SECTION... strip it out so we can inherit the sections settings
    if (line.match(this.lexer.section)) {
      section = line.replace(this.lexer.section_label, '')

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

// Compile the options associated with a slide into key/value pairs
// NOTE: This is begging for a bit of a refactor
Compiler.prototype.compileOptions = function(str, section) {
  var stripped = str.replace(this.lexer.comment, '')
  var space_index = stripped.search(this.lexer.firstspace)
  var o = {master: null, html: ''}
  var options = null

  // if there is only 1 option, assume it's the master template..
  if (space_index < 0) {
    o.master = stripped.substr(space_index + 1)

  // otherwise still grab the master but figure out what the options are
  } else {
    o.master = stripped.substring(0, space_index)
    options = stripped.substr(space_index + 1)
    this.compileExtras(options, section)
  }

  // See if there are any other options to compile and add those in
  if (options) {
    var ops = this.compileExtras(options, section)

    for (var prop in ops) {
      o[prop] = ops[prop]
    }
  }
  // add in properties not in a slide from section and global options
  o = this.inherit(o, this.sectionops[section])
  o = this.inherit(o, this.globalops)
  return o
}

// Turn a string that resembles an object, into a native object
// `"{trasition: fade}"` becomes `{trasition:fade}`
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

// Inherit options either from global or section options to the individual slide
// Slides take precendent, then sections, then global. If property exists let it be.. let it be.. ♫♫
Compiler.prototype.inherit = function(child, parent) {
  for (var prop in parent) {
    if (!this.hasKey(prop, child)) {
      child[prop] = parent[prop]
    }
  }
  return child
}

// Stop messing around and just tell me if it has the key or not
Compiler.prototype.hasKey = function(key, obj) {
  for (var _key in obj) {
    if (_key === key) {
      return true
    }
  }
    return false
}

