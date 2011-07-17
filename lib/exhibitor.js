
var fs = require('fs')
var path = require('path')
var markdown = require('robotskirt')

var Exhibitor = module.exports = function Exhibitor(file) {
  this.config_file = file
  this.config_dir = path.dirname(this.config_file)
  this.cwd = process.cwd()
  this.slide_comment = /<!--\s|SLIDE\s|\s-->/g
  this.first_space = /(?!\w+)\s/
  this.exhibit_data = {}
  this.mkdn_buffer = ''
  this.slides = []
}

// Load the configuration file and build the final json file
Exhibitor.prototype.generate = function() {
  var data = JSON.parse(fs.readFileSync(this.config_file, 'utf8'))

  // Barf if there are no sections
  if (data.sections.length < 1)
    throw new Error('Configuration does not appear to have any sections');

  // save the global properties from the configuration file, need to deal with this later
  for (var prop in data) {
    this.exhibit_data[prop] = data[prop]
  }

  // Concat the sections from the config file into a buffer
  var sections_buffer = this.concatSections(data.sections)

  // Add in any markdown data from @include files
  this.includeFiles(sections_buffer)

  // Turn the buffer into HTML and convert the slides into objects
  this.convertToSlides(this.convertToHTML())

  // Add the sections from the slides back in
  this.exhibit_data.sections = this.slides
  console.log('--------------------------------')

  // Write out the generated JSON file
  console.log(JSON.stringify(this.exhibit_data))
}

// Concatenate the sections into a single buffer
Exhibitor.prototype.concatSections = function(sections) {
  var sections_buffer = ''
  var self = this

  sections.forEach(function (item) {
    sections_buffer += self.concatFiles(item.section)
  })

  return sections_buffer
}

// Find the file and return it's contents
Exhibitor.prototype.concatFiles = function(section) {
  var file = this.findFile(this.config_dir, section) || this.findFile(this.cwd, section)
  if (!file) {
    var msg = 'Could not find the file ' + section + ' in either:'
    msg += '\n' + this.config_dir
    msg += '\n' + this.cwd
    msg += '\nCheck your spelling!'
    throw new Error(msg)
  }
  return fs.readFileSync(file, 'utf8')
}

// Look for the @include tag and recursively add it, if it's not an @include, write it to the final buffer
Exhibitor.prototype.includeFiles = function(buffer) {
  var buff = buffer.split('\n')
  var pattern = /^<!--(\s|\S)SLIDE\s@include/g

  for (var i = 0, len = buff.length; i < len; i += 1) {
    var line = buff[i]
    if (line.substring(0, 2) === '<!') {
      if (line.match(pattern)) {
        this.includeFiles(this.concatFiles(this.getIncludeFileName(line)))
      } else {
        this.writeToMarkdownBuffer(line)
      }
    } else {
      this.writeToMarkdownBuffer(line)
    }
  }
}

// Use robotskirt to convert the markdown to html
Exhibitor.prototype.convertToHTML = function() {
  return markdown.toHtmlSync(this.mkdn_buffer).toString();
}

// Push the sections into individual slide objects
Exhibitor.prototype.convertToSlides = function(html) {
  var buff = html.split('\n')
  var pattern = /^<!--\sSLIDE.*/gm
  var slide

  for (var i = 0, len = buff.length; i < len; i += 1) {
    var line = buff[i]

    // If this is a <!-- SLIDE... parse it's data and add a new data object for it
    if (line.match(pattern)) {
      slide = this.parseOptions(line)
      this.slides.push(slide)

    // Otherwise add it to it's current `slide.html` object
    } else {
      // TODO: This is going to kill the formatting, try the escaped \n first, before converting each snippet
      // slide.html += line + '\n'
      slide.html += line
    }
  }
}

// Kickoff a new object for the slide data, this needs a better name
Exhibitor.prototype.parseOptions = function(str) {
  var stripped = str.replace(this.slide_comment, '')
  var space_index = stripped.search(this.first_space)
  var o = {master: null, html: ''}
  var options = null

  if (space_index < 0) {
    o.master = stripped.substr(space_index + 1)
  } else {
    o.master = stripped.substring(0, space_index)
    options = stripped.substr(space_index + 1)
    this.parseExtras(options)
  }

  if (options) {
    var ops = this.parseExtras(options)

    for (var prop in ops) {
      o[prop] = ops[prop]
    }

  }
  return o
}

// Turn a string into an object
// TODO: Need to add in the global objects
Exhibitor.prototype.parseExtras = function(str) {
  var self = this
  var o = {}
  var ops = str.replace(/(\{|\})/g, '').replace(/:\s/g, ':').replace(/,\s/g, ',')
  var settings = ops.split(',')

  settings.forEach(function (item) {
    var keyvals = item.split(':')
    o[keyvals[0]] = keyvals[1]
  })
  return o
}

// ## Utility Functions

// Find the file name from an @include tag
Exhibitor.prototype.getIncludeFileName = function(desc) {
  var stripped = desc.replace(this.slide_comment, '')
  var space_index = stripped.search(this.first_space)
  var filename = stripped.substr(space_index + 1)
  return filename
}

// Write the contents of the string back to the markdown buffer, add a newline at the end
Exhibitor.prototype.writeToMarkdownBuffer = function(str) {
  var contents = str
  this.mkdn_buffer += contents + '\n'
}

// Look for a file first in the given directory or any of it's subdirectories
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

