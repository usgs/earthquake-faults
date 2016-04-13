/* global chai, describe, it */
'use strict';


var QFaultLayer = require('layer/QFaultLayer');


var expect = chai.expect;


describe('QFaultLayer', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof QFaultLayer).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(QFaultLayer).to.not.throw(Error);
    });
  });
});
