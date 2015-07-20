var Mailer = require('../dist');

var toEmail = process.env.TEST_TO_EMAIL;
var fromEmail = process.env.TEST_FROM_EMAIL;

var mailer = new Mailer(process.env.MANDRILL_API_KEY, {
  hooks : {
    sendEmailBlocked : function(data) {
      console.error('blocked', data);
    },
    sendEmailCompleted : function(data) {
      console.log('completed', data);
    },
    sendEmailFailed : function(data) {
      console.error('email failed', data);
    },
  },
});

mailer.sendEmail(
  {
    from_email : fromEmail,
    to : [
      {
        email : toEmail,
        name : 'test-caleb',
        type : 'to',
      },
    ],
    text : 'Test Text',
  },
  function(err, response) {
    if (err) {
      throw err;
    }
    console.log('^^response', response);
  }
);
