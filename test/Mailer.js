import { expect } from 'chai';

import { Mailer } from '../src/Mailer';

function randStr() {
  return Math.random().toString(36).substring(7);
}

describe('Mailer', () => {

  describe('Empty Whitelist', () => {

    it('should allow any email on null whitelist', () => {

      const mailer = new Mailer('', { whitelist : null });
      const testEmail = randStr() + '@example.com';

      expect(mailer.isEmailAllowed(testEmail)).to.equal(true);

    });

    it('should allow email on empty whitelist', () => {

      const mailer = new Mailer('', { whitelist : [] });
      const testEmail = randStr() + '@example.com';

      expect(mailer.isEmailAllowed(testEmail)).to.equal(true);

    });

  });

});
