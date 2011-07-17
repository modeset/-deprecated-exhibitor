
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

var exhibitor = new Exhibitor(config_file);
var exhibit = exhibitor.generate();

