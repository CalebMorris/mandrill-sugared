import { expect } from 'chai';

import EmailListComparator from '../src/EmailListComparator';

function randStr() {
  return Math.random().toString(36).substring(7);
}

describe('EmailListComparator', () => {

  it('should have no comparators when none are given', () => {

    const testComparator = new EmailListComparator();
    expect(testComparator).to.be.an('object');
    expect(testComparator.groupedEmailPatterns).to.be.empty;

  });

  it('should match on a string when they match', () => {

    const strCompare = randStr();
    const failCompare = randStr();

    const testComparator = new EmailListComparator([ strCompare ]);
    expect(testComparator).to.be.an('object');
    expect(testComparator.groupedEmailPatterns).to.not.be.empty;
    expect(testComparator.groupedEmailPatterns).to.have.all.keys(['string']);
    expect(testComparator.groupedEmailPatterns.string).to.be.an('array');
    expect(testComparator.contains(strCompare)).to.equal(true);
    expect(testComparator.contains(failCompare)).to.equal(false);

  });

  it('should match on a regex when they match', () => {

    const strCompare = randStr();
    const failCompare = randStr();

    const testComparator = new EmailListComparator([ new RegExp(strCompare) ]);
    expect(testComparator).to.be.an('object');
    expect(testComparator.groupedEmailPatterns).to.not.be.empty;
    expect(testComparator.groupedEmailPatterns).to.have.all.keys(['regex']);
    expect(testComparator.groupedEmailPatterns.regex).to.be.an('array');
    expect(testComparator.contains(strCompare)).to.equal(true);
    expect(testComparator.contains(failCompare)).to.equal(false);

  });

  it('should match on either when both exist', () => {

    const strCompare = randStr();
    const regexpCompare = randStr();
    const failCompare = randStr();

    const testComparator = new EmailListComparator([ strCompare, new RegExp(regexpCompare) ]);
    expect(testComparator).to.be.an('object');
    expect(testComparator.groupedEmailPatterns).to.not.be.empty;
    expect(testComparator.groupedEmailPatterns).to.have.all.keys(['string', 'regex']);
    expect(testComparator.contains(strCompare)).to.equal(true);
    expect(testComparator.contains(regexpCompare)).to.equal(true);
    expect(testComparator.contains(failCompare)).to.equal(false);

  });

});
