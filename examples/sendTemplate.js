var Mailer = require('../dist');

var toEmail = process.env.TEST_TO_EMAIL;
var fromEmail = process.env.TEST_FROM_EMAIL;

var mailer = new Mailer(process.env.MANDRILL_API_KEY, {
  hooks : {
    sendTemplateBlocked : function(data) {
      console.error('blocked', data);
    },
    sendTemplateCompleted : function(data) {
      console.log('completed', data);
    },
    sendTemplateFailed : function(data) {
      console.error('email failed', data);
    },
  },
});

mailer.sendEmailTemplate(
  {
    template_name : 'test',
    template_content : [
      {
        name : 'test',
        content : 'test_content',
      },
    ],
    message : {
      from_email : fromEmail,
      to : [
        {
          type : 'to',
          email : toEmail,
        },
      ],
      subject : 'Test Template - Sugared Mandrill',
    },
  },
  function(err, response) {
    if (err) {
      throw err;
    }
    console.log('^^response', response);
  }
);
