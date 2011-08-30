
// ## Lexer
// **File: lib/cli/lexer.js**

// Denotes common patterns for lookups when compiling and parsing

var Lexer = module.exports = function Lexer() {
  this.section = /^<!--\sSECTION.*/gm
  this.stripsect = /<!--\s|SECTION\s|\s-->/g
  this.comment = /<!--\s|SLIDE\s|\s-->/g
  this.options = /^<!--\sSLIDE.*/gm
  this.include = /^<!--(\s|\S)SLIDE\s@include/g
  this.firstspace = /(?!\w+)\s/
}

