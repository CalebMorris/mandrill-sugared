import _ from 'lodash';
import Promise from 'bluebird';
import { Mandrill } from 'mandrill-api/mandrill';

import EmailListComparator from './EmailListComparator';

class Mailer {

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
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.mandrillClient = new Mandrill(apiKey);
    this.whitelist = options.whitelist && new EmailListComparator(options.whitelist) || null;
    this.blacklist = new EmailListComparator(options.blacklist || []);
    this.hooks = _
      .chain(options.hooks)
      .defaults({
        sendEmailBlocked : _.noop,
        sendEmailCompleted : _.noop,
        sendEmailFailed : _.noop,
        sendTemplateBlocked : _.noop,
        sendTemplateCompleted : _.noop,
        sendTemplateFailed : _.noop,
      })
      .value();
  }

  /*
  * @param {String} email
  * @returns {Boolean}
  */
  isEmailAllowed(email) {
    if (this.blacklist.contains(email)) {
      return false;
    }

    if (!this.whitelist) {
      return true;
    }

    return this.whitelist.contains(email);
  }

  /*
  * @param {Object} message
  * @returns {Boolean} List of failed emails
  */
  areMetadataEmailsAllow(message) {
    let areEmailsValid = true;
    const isEmailAllowed = this.isEmailAllowed.bind(this);

    areEmailsValid = _.reduce(message.to, function(memo, toItem) {
      return memo && isEmailAllowed(toItem.email);
    }, areEmailsValid);

    if (message.bcc_address) {
      areEmailsValid = areEmailsValid && isEmailAllowed(message.bcc_address);
    }

    return areEmailsValid;
  }

  /*
  * @param {Object} metadata
  * @param {Func} done Callback on completion
  */
  sendEmail(metadata, done) {
    const self = this;

    return new Promise((resolve, reject) => {
      if (! self.areMetadataEmailsAllow(metadata)) {
        self.hooks.sendEmailBlocked(metadata);
        return resolve();
      }

      return self.mandrillClient.messages
        .send({
          key : self.apiKey,
          message : metadata,
        }, resolve, reject);

    })
    .tap(x => self.hooks.sendEmailCompleted(metadata))
    .catch((err) => {
      self.hooks.sendEmailFailed(metadata, err);
      throw err;
    })
    .nodeify(done);
  }

  /*
  * @param {Object} metadata
  * @param {Func} done Callback on completion
  */
  sendEmailTemplate(metadata, done) {
    const self = this;

    return new Promise((resolve, reject) => {
      if (! self.areMetadataEmailsAllow(metadata.message)) {
        self.hooks.sendTemplateBlocked(metadata);
        return done();
      }

      self.mandrillClient.messages.sendTemplate(
        _.merge({ key : self.apiKey }, metadata),
        resolve,
        reject
      );
    })
      .tap(x => self.hooks.sendTemplateCompleted(metadata))
      .catch((err) => {
        self.hooks.sendTemplateFailed(metadata, err);
        throw err;
      })
      .nodeify(done);
  }

}

export default { Mailer };
