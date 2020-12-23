import nodemailer from'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

class Email {
    constructor(user, url) {
      this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Shunze Lin <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production'){                         
            //Sendgrid
            return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
        // 1) Create a transporter
      return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    }
    // Send the actual email
   async send(template, subject) {
        // 1) Render HTML based on a pug template
        //Take in the file, and render the pug code into real HTML
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
        // 2) Define email options
        const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };
        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }



      async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

     async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}


export default Email;



