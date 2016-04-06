/* global chai, describe, it */
'use strict';


var expect = chai.expect;


describe('index', function () {
  describe('test', function () {
    it('should pass', function () {
      /* jshint -W030 */
      expect(true).to.be.true;
      /* jshint +W030 */
    });
  });
});
