import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Generate a test SMTP service account from ethereal.email
  // This allows us to test email functionality without actual SMTP credentials.
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const message = {
    from: '"TaskMaster Admin" <noreply@taskmaster.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message);
  
  // Ethereal provides a preview URL so you can view the sent email in the browser
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log('-----------------------------------------');
  console.log('Email sent: %s', info.messageId);
  console.log('IMPORTANT -> View Email Preview URL: %s', previewUrl);
  console.log('-----------------------------------------');
  
  return previewUrl;
};

export default sendEmail;
