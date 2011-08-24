
var jasmine = require('jasmine-node')
var verbose = false
var colored = true
var key

for (key in jasmine) {
  if (Object.prototype.hasOwnProperty.call(jasmine, key)) {
    global[key] = jasmine[key];
  }
}

process.argv.forEach(function (arg) {
  switch (arg) {
    case '--no-color':
      colored = false;
    break;
    case '--silent':
      verbose = false;
    break;
  }
})

jasmine.executeSpecsInFolder(__dirname + "/cli/", function (runner, log) {
}, verbose, colored);

