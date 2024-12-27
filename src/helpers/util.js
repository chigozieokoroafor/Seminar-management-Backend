const randToken = require("rand-token")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const fetch = require("node-fetch")
const { success } = require("./statusCodes")

exports.generateUID = (len) =>{

    return randToken.uid(len??32)
}

const secret = process.env.AUTH_KEY

exports.backend_url = process.env.BACKEND_BASE_URL

exports.pExCheck = (reqParams, array) => {
  let resp = [];
  reqParams = JSON.parse(JSON.stringify(reqParams));
  array.forEach(param => {
    if (!reqParams.hasOwnProperty(param) || reqParams[param] == "") {
      resp.push(param);
    }
  });
  return resp;
}

exports.pInCheck = (reqParams, array) => {
  let resp = [];
  if (reqParams) {
    if (Array.isArray(reqParams)) {
      reqParams.forEach(item => {
        if (!array.includes(item)) {
          resp.push(item);
        }
      });
    } else {
      for (let key in reqParams) {
        if (!array.includes(key)) {
          resp.push(key);
        }
      }
    }
  }
  return resp;
}

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

exports.getStudentDetailFronTrackNetque = async (formId, surname) =>{
  const url = process.env.NETQUE_TRACK_URL+`?formId=${formId}&surname=${surname}`

  const response = await fetch(url)
  const json = await response.json()
  if (response.status != 200){
    
    return {success:false, msg:json?.Message}
  }

  const {Email, StudentName, DepartmentName, ProgrammeTitle, Phone, SemesterTitle} = json

  return {success:true, msg:"Successful", data:{formId: formId, email:Email, name: StudentName, dept: DepartmentName, program: ProgrammeTitle, phone:Phone, session: SemesterTitle?.split(" ")[0]}}
  
}

exports.TOKEN_KEYS = {
  0:process.env.STUDENT_AUTH,
  1:process.env.SUPERVISOR_AUTH,
  2:process.env.COORDINATOR_AUTH,
  3:process.env.ADMIN_AUTH,
}