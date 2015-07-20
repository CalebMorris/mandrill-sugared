"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _interopRequire(require("lodash"));

var EmailListComparator = (function () {

  /*
  * @param {(String|Regex)[]} emails
  * @constructor
  */

  function EmailListComparator() {
    var emails = arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, EmailListComparator);

    this.groupedEmailPatters = _.groupBy(emails, function (email) {
      if (_.isString(email)) {
        return "string";
      }
      if (_.isRegExp(email)) {
        return "regex";
      }

      return "other";
    });

    if (this.groupedEmailPatters.other) {
      _.each(this.groupedEmailPatters.other, function (other) {
        /* eslint-disable no-console */
        /* Usage failure needs instruction otherwise */
        console.error("Unsupported type of email pattern for listComparator:", typeof other, other);
        /* eslint-enable no-console */
      });
    }
  }

  _createClass(EmailListComparator, {
    contains: {

      /*
      * @param {String} email
      * @returns {Boolean}
      */

      value: function contains(email) {
        _.each(this.groupedEmailPatters.string, function (emailString) {
          if (email === emailString) {
            return true;
          }
        });

        _.each(this.groupedEmailPatters.regex, function (regex) {
          if (regex.test(email)) {
            return true;
          }
        });

        return false;
      }
    }
  });

  return EmailListComparator;
})();

module.exports = EmailListComparator;