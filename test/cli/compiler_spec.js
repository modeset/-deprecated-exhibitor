
(function() {
  var fs = require('fs')
  var path = require('path')
  var Lexer = require('../../lib/cli/lexer')
  var Compiler = require('../../lib/cli/compiler')
  var compiler

  beforeEach(function() {
    compiler = new Compiler(new Lexer(), {transition: 'slide'}, {section:'cover', transition:'dissolve'})
  })

  describe('#constructor', function() {
    it('should have references to the global options', function() {
      expect(compiler.globalops).not.toEqual(null)
      expect(compiler.globalops.transition).toBe('slide')
    })

    it('should have references to the section options', function() {
      expect(compiler.sectionops).not.toEqual(null)
      expect(compiler.sectionops.transition).toBe('dissolve')
    })
  })

  describe('#compile', function() {

    it('should compile a system test string', function() {
      var str = '<!-- SLIDE bullets {transition: fade, date: January 30} -->\n<h1>Header</h1>'
      var obj = [{master: 'bullets', html: '<h1>Header</h1>', transition: 'fade', date: 'January 30'}]
      var converted = compiler.compile(str)
      expect(converted).toEqual(obj)
      expect(converted[0].transition).toEqual('fade')
    })
  })

  describe('#compileOptions', function() {
    it('should compile a comment block into an object', function() {
      var simp_str = '<!-- SLIDE image -->'
      var full_str = '<!-- SLIDE bullets {transition: fade, date: January 30} -->'
      var simp_obj = {master: 'image', html: '', transition: 'slide'}
      var full_obj = {master: 'bullets', html: '', transition: 'fade', date: 'January 30'}
      var simp_converted = compiler.compileOptions(simp_str)
      var full_converted = compiler.compileOptions(full_str)

      expect(simp_converted).toEqual(simp_obj)
      expect(full_converted).toEqual(full_obj)
      expect(simp_converted.master).toEqual('image')
      expect(full_converted.master).toEqual('bullets')
    })
  })

  describe('#compileExtras', function() {
    it('should compile a string of extra options into a native object', function() {
      var ops_str = '{transition: fade, date: January 30}'
      var ops_obj = {transition: 'fade', date: 'January 30'}
      var converted = compiler.compileExtras(ops_str)

      expect(converted).toEqual(ops_obj)
      expect(converted.transition).toEqual('fade')
    })
  })

  describe('#inherit', function() {
    it('should inherit properties from an object', function() {
      var parent = {key1: 'override', key2: 'inherited' }
      var child = {key1: 'child_element'}
      var inherited = compiler.inherit(child, parent)

      expect(inherited.key1).toBe('child_element')
      expect(inherited.key2).toBe('inherited')
    })
  })

  describe('#hasKey', function() {
    it('should return a value based on the key being found in an object', function() {
      var obj = {key1: 'value1', key2: 'value2'}
      expect(compiler.hasKey('key1', obj)).toBeTruthy()
      expect(compiler.hasKey('key2', obj)).toBeTruthy()
      expect(compiler.hasKey('key3', obj)).not.toBeTruthy()
    })
  })

}())

