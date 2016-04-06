/* global chai, describe, it */
'use strict';


var FaultApp = require('FaultApp');


var expect = chai.expect;


describe('FaultApp', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof FaultApp).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(FaultApp).to.not.throw(Error);
    });
  });
});
