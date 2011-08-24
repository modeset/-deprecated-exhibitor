
var fs = require('fs')
var path = require('path')
var cli = __dirname + '/../lib/cli/';
var Converter = require('../lib/cli/converter')
var args = process.argv.slice(2)
var silent = false

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
  msg += '\n  run "exhibitor help" for more information'
  return msg
}

function help() {
  abort(fs.readFileSync(cli + 'help.txt', 'utf8'));
}

function convert(file, output) {
  if (!file || !output)
    abort(errormessage());

  var converter = new Converter(file);
  var exhibit = converter.convert();
  fs.writeFile(output, exhibit, 'utf8', function(err) {
    if (err) {
      abort(err)
    }
    console.log('converted: ' + output)
    notify(exhibit)
  })
}

// ----------------------------------------------------------------------------
// Process the command line arguments
if (args.length < 1) help()

while (args.length) {
  var arg = args.shift();
  switch (arg) {

    case 'convert':
      convert(path.join(process.cwd(), args.shift()), path.join(process.cwd(), args.shift()))
    break;

    case '-v':
    case 'version':
    case '--version':
      abort('need to set the version')
      // abort(JSON.parse(fs.readFileSync(npm, 'utf8')).version);
    break;

    case '-h':
    case 'help':
    case '--help':
      help()
    break;

    default:
      help()
    break;
  }
}

