/* global chai, describe, it */
'use strict';


var FaultLayer = require('layer/FaultLayer');


var expect = chai.expect;


describe('FaultLayer', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof FaultLayer).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(FaultLayer).to.not.throw(Error);
    });
  });
});
