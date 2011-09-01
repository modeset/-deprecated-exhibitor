
// ## Lexer
// **File: lib/cli/lexer.js**

// Common patterns for lookups when compiling and parsing

var Lexer = module.exports = function Lexer() {
  // Finds the comment pattern: `<!-- SECTION name -->`
  // Note this is insecure, but it should only be running locally
  this.section = /^<!--\sSECTION.*/gm

  // Finds the string pattern to rip out to reveal the section's name: `<!-- SECTION -->`
  this.section_label = /<!--\s|SECTION\s|\s-->/g

  // Finds the comment pattern for a slide: `<!-- SLIDE bullets {transition: fade}`
  this.comment = /<!--\s|SLIDE\s|\s-->/g

  // Used to strip out the `<!-- SLIDE -->` string to reveal the object options: `{transition: fade}`
  // Note this is insecure, but it should only be running locally
  this.options = /^<!--\sSLIDE.*/gm

  // Looks for the `@include` pattern to locate a markdown file to be included in the concatenation
  this.include = /^<!--(\s|\S)SLIDE\s@include/g

  // Finds the first space within a string pattern
  this.firstspace = /(?!\w+)\s/

  // Looks for the `{}` when parsing options into a native object
  this.brackets = /(\{|\})/g

  // Normalizes a colon and it's surrounding whitespace: `: `
  this.colons = /:\s/g

  // Normalizes a comma and it's surrounding whitespace: `, `
  this.commas = /,\s/g
}

