
// ## Exhibitor
// **File: lib/cli/exhibitor.js**

// Wrapper for concatenating markdown (specific for slides) and outputing json

// Module dependency
var fs = require('fs')
var path = require('path')
var markdown = require('robotskirt')
var exec = require('child_process').exec

var Lexer = require('./lexer')
var Parser = require('./parser')
var Compiler = require('./compiler')

var Exhibitor = module.exports = function Exhibitor(input, output, silent) {
  this.input = input
  this.output = output
  this.input_dir = path.dirname(this.input)
  this.silent = silent || false
}

Exhibitor.prototype.render = function() {
  var lexer = new Lexer()
  var parser = new Parser(lexer, this.readInput(this.input), this.input_dir)
  var compiler = new Compiler(lexer, parser.globalOptions(), parser.sectionOptions())
  var mkd = parser.compile()
  var html = this.convertToHTML(mkd)
  var json = JSON.stringify(compiler.compile(html), null, 2)
  this.writeOutput(json)
  // console.log(json)
}

// ----------------------------------------------------------------------------
Exhibitor.prototype.readInput = function() {
  return JSON.parse(fs.readFileSync(this.input, 'utf8'))
}

Exhibitor.prototype.convertToHTML = function(mkd) {
  return markdown.toHtmlSync(mkd).toString();
}

Exhibitor.prototype.writeOutput = function(json) {
  var self = this
  fs.writeFile(this.output, json, 'utf8', function(err) {
    if (err) {
      console.error(err)
    } else {
      if (!self.silent) {
        console.log(self.output + ' written')
      }
    }
  })
}

