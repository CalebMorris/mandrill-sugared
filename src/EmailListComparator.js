import _ from 'lodash';

class EmailListComparator {

  /*
  * @param {(String|Regex)[]} emails
  * @constructor
  */
  constructor(emails = []) {
    this.groupedEmailPatterns = _.groupBy(emails, (email) => {
      if (_.isString(email)) {
        return 'string';
      }
      if (_.isRegExp(email)) {
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
    _.each(this.groupedEmailPatterns.string, (emailString) => {
      if (email === emailString) {
        return true;
      }
    });

    _.each(this.groupedEmailPatterns.regex, (regex) => {
      if (regex.test(email)) {
        return true;
      }
    });

    return false;
  }

}

export default EmailListComparator;
