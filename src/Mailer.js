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
    this.mandrilClient = new Mandrill(apiKey);
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
      .map(hook => _.isFunction(hook) && hook || _.noop);
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
  * @param {Object} metadata
  * @returns {Boolean} List of failed emails
  */
  areMetadataEmailsAllow(metadata) {
    let areEmailsValid = true;

    areEmailsValid = _.reduce(metadata.message.to, function(memo, toItem) {
      return memo && this.isEmailAllowed(toItem.email);
    }, areEmailsValid);

    if (metadata.bcc_address) {
      areEmailsValid = areEmailsValid && this.isEmailAllowed(metadata.bcc_address);
    }

    return areEmailsValid;
  }

  /*
  * @param {Object} metadata
  * @param {Func} done Callback on completion
  */
  sendEmail(metadata, done) {
    return new Promise((resolve, reject) => {
      if (! this.areMetadataEmailsAllow(metadata)) {
        this.hooks.sendEmailBlocked(metadata);
        return resolve();
      }

      return this.mandrillClient.messages
        .send({ message : metadata }, resolve, reject);

    })
    .tap(x => this.hooks.sendEmailCompleted(metadata))
    .catch((err) => {
      this.hooks.sendEmailFailed(metadata, err);
      throw err;
    })
    .nodeify(done);
  }

  /*
  * @param {Object} metadata
  * @param {Func} done Callback on completion
  */
  sendEmailTemplate(metadata, done) {
    return new Promise((resolve, reject) => {
      if (! this.areMetadataEmailsAllow(metadata)) {
        this.hooks.sendTemplateBlocked(metadata);
        return done();
      }

      this.mandrillClient.messages.sendTemplate(metadata, resolve, reject);
    })
      .tap(x => this.hooks.sendTemplateCompleted(metadata))
      .catch((err) => {
        this.hooks.sendTemplateFailed(metadata, err);
        throw err;
      })
      .nodeify(done);
  }

}

export default { Mailer };
