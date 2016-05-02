/* global chai, describe, it */
'use strict';


var Legend = require('control/Legend');


var expect = chai.expect;


describe('Legend', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof Legend).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(Legend).to.not.throw(Error);
    });
  });
});
