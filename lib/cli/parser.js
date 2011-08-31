
// ## Parser
// **File: lib/cli/parser.js**

// Concatenates a configuration object of markdown files into a single buffer

// Module dependency
var fs = require('fs')
var path = require('path')

// Instantiate the parser, set up pathing and define token patterns for parsing.
var Parser = module.exports = function Parser(lexer, json, config_dir) {
  this.lexer = lexer
  this.config = json
  this.config_dir = config_dir || __dirname
  this.cwd = process.cwd()
  this.tmp_buffer = ''
}

Parser.prototype.globalOptions = function() {
  var o = {}
  for (var prop in this.config) {
    if (prop !== 'sections') {
      o[prop] = this.config[prop]
    }
  }
  return o
}

Parser.prototype.sectionOptions = function() {
  var sections = this.config.sections
  var o = {}

  for (var i = 0, len = sections.length; i < len; i += 1) {
    var section = sections[i]
    var key = section.section
    o[key] = {}
    for (var prop in section) {
      if (prop !== 'section') {
        o[key][prop] = section[prop]
      }
    }
  }
  return o
}

// The public method to start compilation of the configuration file
Parser.prototype.compile = function() {
  var sections = this.config.sections
  this.render(this.concat(sections))
  return this.tmp_buffer
}

// Read all the sections and concatenate into a single buffer
Parser.prototype.concat = function(sections) {
  var self = this
  var buffer = ''
  sections.forEach(function (section) {
    buffer += '<!-- SECTION ' + section.section + ' -->\n'
    buffer += self.readFile(section.section)
  })
  return buffer
}

// Read each line of the buffer and send out to be analyzed for `@include` tags
Parser.prototype.render = function(buffer) {
  var buff = buffer.split('\n')
  for (var i = 0, len = buff.length; i < len; i += 1) {
    var line = buff[i]
    this.tmp_buffer += this.scan(line) + ((i < len - 1) ? '\n' : '')
  }
}

// Read the contents of an `@include` tag and send out for scanning
Parser.prototype.included = function(file) {
  var buffer = this.readFile(file)
  var buff = buffer.split('\n')
  var analyzed = ''
  for (var i = 0, len = buff.length; i < len; i += 1) {
    var line = buff[i]
    analyzed += this.scan(line) + ((i < len - 1) ? '\n' : '')
  }
  return analyzed
}

// Look for the `@include` tag within a line of the buffer
Parser.prototype.scan = function(line) {
  if (line.substring(0, 2) === '<!' && line.match(this.lexer.include)) {
    return this.included(this.getIncludeName(line))
  } else {
    return line
  }
}

// Read a file and return it's contents
Parser.prototype.readFile = function(section) {
  var file = this.findFile(this.config_dir, section) || this.findFile(this.cwd, section)
  if (!file) {
    throw new Error(this.notify(section))
  }
  return fs.readFileSync(file, 'utf8')
}

// Look for the file, first in the configuration file's directory.
// Otherwise start at the `cwd` and hopefully it's found.
Parser.prototype.findFile = function(dir, file) {
  var self = this
  var buffer
  var tmp

  fs.readdirSync(dir).forEach(function (item) {
    var absolute = path.normalize(dir + '/' + item)

    // extension should be a regex but not possible with basename
    if (fs.statSync(absolute).isFile() && path.basename(item, '.md') === file) {
      buffer = absolute
      return;
    } else if (fs.statSync(absolute).isDirectory()) {
      tmp = self.findFile(absolute, file)
      if (tmp) {
        buffer = tmp
        return;
      }
    }
  })
  return buffer
}

// Parse out the file name from a `<!-- SLIDE @include filename -->` comment
Parser.prototype.getIncludeName = function(desc) {
  var stripped = desc.replace(this.lexer.comment, '')
  var space_index = stripped.search(this.lexer.firstspace)
  return stripped.substr(space_index + 1)
}

// Return a an error string when a file is not found
Parser.prototype.notify = function(section) {
    var msg = 'File: ' + section + ' not found!'
    msg += '\n checked: ' + this.config_dir + ' (including subdirectories)'
    msg += '\n checked: ' + this.cwd + ' (including subdirectories)'
    return msg
}

