
var path = require('path')
var Exhibitor = require('../lib/exhibitor')
var args = process.argv.slice(2)
var silent = false
var config_file = null
var inspect = require('util').inspect

// ----------------------------------------------------------------------------
function notify(msg) {
  if (!silent) {
    console.log(msg)
  }
}

function abort(msg) {
  console.error(msg)
  process.exit(1)
}

function errormessage() {
  var msg = 'Error:'
  msg += '\n  Missing a configuration file'
  msg += '\n  run "exhibitor --help" for more information'
  return msg
}

// ----------------------------------------------------------------------------
// Process the command line arguments
while (args.length) {
  var arg = args.shift();
  switch (arg) {

    case '-h':
    case '--help':
      // abort(fs.readFileSync(templates + 'help.txt', 'utf8'));
    break;

    case '-v':
    case '--version':
      // abort(JSON.parse(fs.readFileSync(npm, 'utf8')).version);
    break;

    case '-s':
    case '--silent':
      silent = true;
    break;

    default:
      config_file = path.join(process.cwd(), arg);
    break;
  }
}

if (!config_file)
  abort(errormessage());

var exibitor = new Exhibitor(config_file)
var exhibit = exibitor.generate()
console.log('--------------------------------')
console.log(JSON.stringify(exhibit))

/*
-------------------------------------------------------------------------------
On publish:
- Load the config file
- Store the global variables
- Loop through the sections
  - Store the sections options from the config
  - Load the section.md file
    - First look for it in the existing directory or it's subdirectories
    - Second look for a variable on where to possibly find the file from the config
    - Third, start at the root of the project looking in all of the directories (don't look where we have already been)
    - If not found, throw an error with a description
  - Parse the file looking for !SLIDE or <!SLIDE at the beginning of the line to the next !SLIDE object or EOF
    - If the slide has an @include recurivelly parse that out in the steps above (Load the section.md file)
      - if there are options in the top most file, they override whats in the @include file
    - else if there is no @include
      - Save the options to a data key
      - Parse the markdown to html and store in an html key
      - This might be the point we need to load pygments

- Turn the objects into JSON
- Write out the generated json file


- Load the config file
- Store the global variables
- Loop through the sections
  - Store the section options from the config
  - Load the section.md file
  - Convert the md file to html
  - Loop through the sections looking for !SLIDE
  - If no @include, store the html in a key
  - If there is an @include, recursivelly parse that file out
  - Store the key/values for the slide(s) to an internal object
- Write out the object to a JSON file
-------------------------------------------------------------------------------
  :smart, :hard_wrap, :gh_blockcode, :safelink, :generate_toc,
  :autolink, :tables, :strikethrough, :fenced_code, :lax_htmlblock,
  :no_intraemphasis, :xhtml, :space_header

  robotskirt supports:
  safelink, autolink, strikethrough, fenced code, lax_htmlblock, no_intraemphasis, :xhtml, space header
  you can use regular html

  robotskirt no support:
  smart, hardwrap (needs 2 spaces after the text), toc(we can solve this clientside), tables
-------------------------------------------------------------------------------
*/

