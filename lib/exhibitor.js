
var fs = require('fs')
var path = require('path')
var markdown = require('robotskirt')
var inspect = require('util').inspect

var Exhibitor = module.exports = function Exhibitor(file) {
  this.config_file = file
  this.config_dir = path.dirname(this.config_file)
  this.cwd = process.cwd()
  this.exhibit_data = {}
  this.slides = []
}

Exhibitor.prototype.generate = function() {
  // load the configuration file
  var data = JSON.parse(fs.readFileSync(this.config_file, 'utf8'))

  // if there aren't sections, there can't be slides!
  if (data.sections.length < 1)
    throw new Error('Configuration does not appear to have any sections');

  // save the global properties from the configuration file, need to deal with this later
  for (var prop in data) {
    this.exhibit_data[prop] = data[prop]
  }
  // generate the data for each section
  this.parseSections(data.sections)

  // now that we have all the slides in proper form save them back
  this.exhibit_data['sections'] = this.slides

  // whoever called this should be writing the generated json file
  return this.exhibit_data
}

// Rip through each set of sections from the configuration file, converting along the way
Exhibitor.prototype.parseSections = function(sections) {
  for (var i = 0, len = sections.length; i < len; i += 1) {
    this.parseSection(sections[i])
  }
}

// Load the markdown file, convert it to html and then save each slide
Exhibitor.prototype.parseSection = function(section) {
  var file = section.section
  var buffer = this.findFile(this.config_dir, file) || this.findFile(this.cwd, file)
  var html = this.toHTML(buffer)
  this.convertToSlides(html)
}

// look for a file first in the configuration directory, if not found, look from the cwd
Exhibitor.prototype.findFile = function(dir, file) {
  var self = this
  var buffer;
  var tmp;

  fs.readdirSync(dir).forEach(function (item) {
    var absolute = path.normalize(dir + '/' + item)
    // TODO: extension should be a regex but not possible with basename
    if (fs.statSync(absolute).isFile() && path.basename(item, '.md') === file) {
      buffer = absolute
      return;
    } else if (fs.statSync(absolute).isDirectory()) {
      tmp = self.findFile(absolute, file)
      if (tmp) {
        buffer = tmp;
        return;
      }
    }
  })
  return buffer
}

// use robotskirt to convert the markdown to html
Exhibitor.prototype.toHTML = function(file) {
  var contents = fs.readFileSync(file, 'utf8')
  var html = markdown.toHtmlSync(contents).toString()
  // TODO: add gh block in string before returning
  return html
}

// pass in options for parsing a slide
// Anything with a @include should call parse section
Exhibitor.prototype.convertToSlides = function(html) {
  var pattern = /^<!--\sSLIDE.*/gm
  var buffer = html.split('\n')
  var data;

  for (var i = 0, len = buffer.length; i < len; i += 1) {
    if (buffer[i].match(pattern)) {
      data = this.parseOptions(buffer[i])
      data.html = ''
      this.slides.push(data)
    } else {
      data.html += buffer[i]
    }
  }
}

Exhibitor.prototype.getSlideType = function() {
}

Exhibitor.prototype.parseOptions = function(raw) {
  var data = {}
  var pattern = /<!--\s|SLIDE\s|\s-->/g
  var first_space = /(?!\w+)\s/
  var stripped = raw.replace(pattern, '')
  var space_index = stripped.search(first_space)
  var ops = []

  if (space_index < 0) {
    ops.push(stripped.substr(space_index + 1))
  } else {
    ops.push(stripped.substring(0, space_index))
    ops.push(stripped.substr(space_index + 1))
  }

  if (ops[0] ==='@include') {
    // console.log('need to load ' + ops[1])
    this.parseSection({section: ops[1]})
  } else {
    data.master = ops[0]
    data.options = ops[1] || null
  }

  // console.log(ops)

  // if (ops[1]) {
    // console.log(ops[1])
  // }



  return data
}

