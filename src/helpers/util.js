const randToken = require("rand-token")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

const generateUID = (len) =>{

    return randToken.uid(len??32)
}

const secret = process.env.AUTH_KEY

exports.backend_url = "http://localhost:3003/"

exports.generateToken = (payload, time, s) => {
    const _secret = s ?? secret
    return jwt.sign({ payload: payload }, _secret, { expiresIn: time })
}

exports.mailSend = (subject, to, html, attachments) => { //attachments should be an array
    try {
      const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        // debug:true,
        // logger:true,
        auth: {
          type: "LOGIN",
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PWD,
        },
        // connectionTimeout: 10000, // increase timeout
        // greetingTimeout: 10000
      });
  
      const mailOptions = {
        from: `"SeMaSy" <${process.env.MAIL_USER}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        html,  // html body
      };
      if (attachments) {
        mailOptions.attachments = attachments;
      }
  
      smtpTransport.sendMail(mailOptions);
    } catch (err) {
      console.log('sendEmail', err.message);
    }
  }
  
  exports.destructureToken = (token, s) => {
    const _secret = s ? s : secret
  
    try {
      return jwt.verify(token, _secret)?.payload;
    } catch (error) {
      return false
  
      //   if (error.name === "TokenExpiredError") {
      //     err = "Session Expired.";
      //     err_status = 403;
      //     return false
      // } else if (error.name === "JsonWebTokenError") {
      //     err = "Invalid Token";
      //     err_status = 498;
      //     return false
      // }
  
    }
  };

