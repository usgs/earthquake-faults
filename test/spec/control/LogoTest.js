/* global chai, describe, it */
'use strict';


var Logo = require('control/Logo');


var expect = chai.expect;


describe('Logo', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof Logo).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(Logo).to.not.throw(Error);
    });
  });
});
