"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _interopRequire(require("lodash"));

var EmailListComparator = (function () {

  /*
  * @param {(String|Regex)[]} patterns
  * @constructor
  */

  function EmailListComparator() {
    var patterns = arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, EmailListComparator);

    this.groupedEmailPatterns = _.groupBy(patterns, function (pattern) {
      if (_.isString(pattern)) {
        return "string";
      }
      if (_.isRegExp(pattern)) {
        return "regex";
      }

      return "other";
    });

    if (this.groupedEmailPatterns.other) {
      _.each(this.groupedEmailPatterns.other, function (other) {
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
        if (this.groupedEmailPatterns.string) {
          for (var i = this.groupedEmailPatterns.string.length - 1; i >= 0; i--) {
            var emailString = this.groupedEmailPatterns.string[i];
            if (email === emailString) {
              return true;
            }
          }
        }

        if (this.groupedEmailPatterns.regex) {
          for (var i = this.groupedEmailPatterns.regex.length - 1; i >= 0; i--) {
            var regex = this.groupedEmailPatterns.regex[i];
            if (regex.test(email)) {
              return true;
            }
          }
        }

        return false;
      }
    }
  });

  return EmailListComparator;
})();

module.exports = EmailListComparator;