import _ from 'lodash';

class EmailListComparator {

  /*
  * @param {(String|Regex)[]} patterns
  * @constructor
  */
  constructor(patterns = []) {
    this.groupedEmailPatterns = _.groupBy(patterns, (pattern) => {
      if (_.isString(pattern)) {
        return 'string';
      }
      if (_.isRegExp(pattern)) {
        return 'regex';
      }

      return 'other';
    });

    if (this.groupedEmailPatterns.other) {
      _.each(this.groupedEmailPatterns.other, (other) => {
        /* eslint-disable no-console */
        /* Usage failure needs instruction otherwise */
        console.error(
          'Unsupported type of email pattern for listComparator:',
          (typeof other),
          other);
        /* eslint-enable no-console */
      });
    }
  }

  /*
  * @param {String} email
  * @returns {Boolean}
  */
  contains(email) {
    if (this.groupedEmailPatterns.string) {
      for (let i = this.groupedEmailPatterns.string.length - 1; i >= 0; i--) {
        const emailString = this.groupedEmailPatterns.string[ i ];
        if (email === emailString) {
          return true;
        }
      }
    }

    if (this.groupedEmailPatterns.regex) {
      for (let i = this.groupedEmailPatterns.regex.length - 1; i >= 0; i--) {
        const regex = this.groupedEmailPatterns.regex[ i ];
        if (regex.test(email)) {
          return true;
        }
      }
    }

    return false;
  }

}

export default EmailListComparator;
