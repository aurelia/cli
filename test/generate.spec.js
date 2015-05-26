import {expect} from 'chai';

describe('installer unit tests', () => {
  var sut;

  beforeEach(() => {
    sut = require('../src/lib/generator');
  });

  describe('creating a viewmodel', () => {
    it('should throw exception if name is not specified', () => {
      expect( () => { sut.createViewModel(undefined); }).to.throw('You must provide a name for the new element');
    });

    it('should throw an error if the given template does not exist', () => {
      expect( () => { sut.createViewModel('test'); }).to.throw('the entered template does not exist');
      expect( () => { sut.createViewModel('test', 'sdlfkjsdlfkj'); }).to.throw('the entered template does not exist');
    });
  });

  describe('creating a view', () => {
    it('should throw exception if name is not specified', () => {
      expect( () => { sut.createView(undefined); }).to.throw('You must provide a name for the new element');
    });

    it('should throw an error if the given template does not exist', () => {
      expect( () => { sut.createView('test'); }).to.throw('the entered template does not exist');
      expect( () => { sut.createView('sdfsdfsdf'); }).to.throw('the entered template does not exist');
    });
  });

  describe('test handlebars helper', () => {
    var handlebars = require('handlebars')
      , joinHtml = "constructor({{#join inject ','}}{{toCamelCase this}}{{/join}})";


    it('should properly join an array of items', () => {
      var compiled = handlebars.compile(joinHtml)
        , result   = compiled({
        inject: ['test1', 'test2', 'test3']
      });

      expect(result).to.equal('constructor(test1,test2,test3)');
    });

    it('should use a string if given', () => {
      var compiled = handlebars.compile(joinHtml)
        , result   = compiled({
            inject: 'a-simple!string'
          });

      expect(result).to.equal('constructor(a-simple!string)');
    });

    it('should pascal case the given string', () => {
      var compiled = handlebars.compile("{{toCamelCase name}}")
        , result   = compiled({ name: 'ThisIsATest'});

      expect(result).to.equal('thisIsATest');
    });
  });
});
