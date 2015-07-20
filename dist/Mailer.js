"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _interopRequire(require("lodash"));

var Promise = _interopRequire(require("bluebird"));

var Mandrill = require("mandrill-api/mandrill").Mandrill;

var EmailListComparator = _interopRequire(require("./EmailListComparator"));

var Mailer = (function () {

  /*
  * @param {String} apiKey
  * @param {Object=} options
  *   @param {(Regex|String)[]} whitelist Whitelisted emails so only these are sent
  *   @param {(Regex|String)[]} blacklist Blacklisted emails - black overrides white
  *   @param {Object<String,Func>} hooks - Hooks will be of the form (data, [err])
  *     @param {Func} sendEmailBlocked
  *     @param {Func} sendEmailCompleted
  *     @param {Func} sendTemplateBlocked
  * @constructor
  */

  function Mailer(apiKey) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Mailer);

    this.mandrilClient = new Mandrill(apiKey);
    this.whitelist = options.whitelist && new EmailListComparator(options.whitelist) || null;
    this.blacklist = new EmailListComparator(options.blacklist || []);
    this.hooks = _.chain(options.hooks).defaults({
      sendEmailBlocked: _.noop,
      sendEmailCompleted: _.noop,
      sendEmailFailed: _.noop,
      sendTemplateBlocked: _.noop,
      sendTemplateCompleted: _.noop,
      sendTemplateFailed: _.noop }).map(function (hook) {
      return _.isFunction(hook) && hook || _.noop;
    });
  }

  _createClass(Mailer, {
    isEmailAllowed: {

      /*
      * @param {String} email
      * @returns {Boolean}
      */

      value: function isEmailAllowed(email) {
        if (this.blacklist.contains(email)) {
          return false;
        }

        if (!this.whitelist) {
          return true;
        }

        return this.whitelist.contains(email);
      }
    },
    areMetadataEmailsAllow: {

      /*
      * @param {Object} metadata
      * @returns {Boolean} List of failed emails
      */

      value: function areMetadataEmailsAllow(metadata) {
        var areEmailsValid = true;

        areEmailsValid = _.reduce(metadata.message.to, function (memo, toItem) {
          return memo && this.isEmailAllowed(toItem.email);
        }, areEmailsValid);

        if (metadata.bcc_address) {
          areEmailsValid = areEmailsValid && this.isEmailAllowed(metadata.bcc_address);
        }

        return areEmailsValid;
      }
    },
    sendEmail: {

      /*
      * @param {Object} metadata
      * @param {Func} done Callback on completion
      */

      value: function sendEmail(metadata, done) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          if (!_this.areMetadataEmailsAllow(metadata)) {
            _this.hooks.sendEmailBlocked(metadata);
            return resolve();
          }

          return _this.mandrillClient.messages.send({ message: metadata }, resolve, reject);
        }).tap(function (x) {
          return _this.hooks.sendEmailCompleted(metadata);
        })["catch"](function (err) {
          _this.hooks.sendEmailFailed(metadata, err);
          throw err;
        }).nodeify(done);
      }
    },
    sendEmailTemplate: {

      /*
      * @param {Object} metadata
      * @param {Func} done Callback on completion
      */

      value: function sendEmailTemplate(metadata, done) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          if (!_this.areMetadataEmailsAllow(metadata)) {
            _this.hooks.sendTemplateBlocked(metadata);
            return done();
          }

          _this.mandrillClient.messages.sendTemplate(metadata, resolve, reject);
        }).tap(function (x) {
          return _this.hooks.sendTemplateCompleted(metadata);
        })["catch"](function (err) {
          _this.hooks.sendTemplateFailed(metadata, err);
          throw err;
        }).nodeify(done);
      }
    }
  });

  return Mailer;
})();

module.exports = { Mailer: Mailer };