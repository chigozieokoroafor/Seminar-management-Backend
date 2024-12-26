const bcrypt = require("bcrypt");
const { User } = require('../db/model');
const { backend_url, destructureToken, mailSend, generateToken, reVerificationTag, getStudentDetailFronTrackNetque, pExCheck } = require('../helpers/util');
// const { createUser, getUser, updateUser, getUserByVerificationtag, createVerificationTagForUser } = require('../db/query');
const { success, notAcceptable, notFound, invalid, internalServerError, generalError, exists, expired } = require('../helpers/statusCodes');
const { studentAccountCreatorValidator } = require('../helpers/validator');
const { P } = require("../helpers/consts");



// Create Account for default
// exports.createAccount = async (req, res) => {
//     const { email, password, first_name, last_name, firebase_auth } = req.body;
  
//     if (!email || !password || !first_name || !last_name) {
//       return generalError(res, 'Required fields missing or empty')
//     }
  
//     try {
//       const existingUser = await User.findOne({ where: { email } });
//       if (existingUser) {
//         return exists(res, 'Account with email exists')
//       }
//       const hashedPassword = bcrypt.hashSync(password, 8);
//       const data = {
//         email,
//         password: hashedPassword,
//         first_name,
//         last_name,
//       }
//       let ext
//       const resolved = await Promise.allSettled([createUser(data), createVerificationTagForUser(email)])
      
//       if (resolved[0].status == "rejected"){
//         return generalError(res, "Unable to create Account, Please try at a later time.")
//       }
//       if (resolved[1].status){
//         ext = resolved[1].value
//       }
      
      
//       const token = generateToken({email:email}, 1*5*60, process.env.ACC_VERIFICATION_KEY)
  
//       // const verificationUri = backend_url+`/auth/verify?token=${token}`
//       // const verificationUri = `https://lookupon.vercel.app/verification?token=${token}` // live
//       const verificationUri = `${backend_url}/verification?token=${token}&ext=${ext}`
//       const emailTemp = `<p>Click <a href="${verificationUri}">here</a> to verify your email.</p>`; // Adjust the email template as needed
//       mailSend("Account verification",email, emailTemp);
  
//       success(res, {}, 'Account Created, kindly check mail provided for verification link.')
      
//     } catch (error) {
//       // console.error(error);
  
//       res.status(400).json({ msg: 'Error occurred while creating account' }); 
//     }
// };

// flow for students
// Enter form number - fetch - update information- submit - login
exports.getstudentDetailFronNetQue = async(req, res) =>{
  // this to be used for first interaction
  // resulting data will be passed in the createAccount enpoint
  const missing = pExCheck(req?.body, [P.formId, P.surname])

  if (missing.length > 0){
    return generalError(res, `Missing fields: ${missing.toLocaleString()}`)
  }

  const valid_ = studentAccountCreatorValidator.validate(req?.body)
  if (valid_?.error){
    return generalError(res, valid_?.error?.message)
  }
  const detail = await getStudentDetailFronTrackNetque(req?.body?.formId, req?.body?.surname)
  if (!detail?.success) return generalError(res, "Kindly check details provided")
  
  return success(res, detail?.data, "Valid")
}

exports.createAccountStudent = async(req, res) =>{
  const missing = pExCheck(req?.body, [P.formId, P.surname])
}




  
// Sign In
exports.signin =async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      // return res.status(406).json({ msg: 'Email and password fields required' });
      return notAcceptable(res, 'Email and password fields required')
    }
  
    try {
      const user = await getUser({email:email})
  
      if (!user) {
        // return res.status(404).json({ msg: "Account with credentials provided doesn't exist" });
        return notFound(res, "Account with credentials provided doesn't exist")
      }
  
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        // return res.status(401).json({ msg: 'Invalid password' });
        return generalError(res, "Invalid credentials")
      }
  
      const token = generateToken({ uid: user.uid }, 1*600*60);
      return success(res, {token}, "")
    } catch (error) {
      console.error(error);
      return internalServerError(res, 'Error occurred while signing in')
    }
};
  
  
// Verify Email
exports.verify = async (req, res) => {
    const { token } = req.query;
  
    const data = destructureToken(token, 'email_verification');
    if (!data) {
      // return res.status(410).json({ msg: 'Verification Link expired, Kindly request for another to verify account' });
      return expired(res, "Session expired")
    }
  
    try {
      const update = await updateUser({email:data}, {account_verified:true})
      return success(res, {}, "Verified")
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error occurred while verifying account' });
    }
};
  
// Send Password Reset Email
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = getUser({email})
      if (!user) {
        // return res.status(404).json({ msg: 'Account with email not found' });
        return notFound(res, "Account with mail not found")
      }
      
      const token = generateToken({ email }, 1*5*60, process.env.PWD_RESET_KEY);
      // const PWD_RESET_URL = `https://lookupon.vercel.app/reset-password?token=${token}`
      const PWD_RESET_URL = `https://localhost:3000/reset-password?token=${token}`
      const emailTemp = `<p>Click <a href="${PWD_RESET_URL}">here</a> to reset your password.</p>`; // Adjust the email template as needed
      const mailSent =  mailSend(email, emailTemp, 'Password Reset Request');
  
      if (!mailSent) {
        return res.status(400).json({ msg: 'Error occurred while sending mail' });
      }
  
      return success(res, {}, 'Password reset mail sent')
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error occurred while sending password reset mail' });
    }
};
  
// Update Password
exports.updatePassword = async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
  
    if (!token) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
  
    const data = destructureToken(token, process.env.PWD_RESET_KEY);
    
    if (!data) {
      return expired(res, "Verification link expired")
      // return res.status(410).json({ msg: 'Token expired' });
    }
  
    if (!password) {
      return res.status(412).json({ msg: 'New password required', "success":false});
    }
  
    try {
      const hashedPassword = bcrypt.hashSync(password, 8);
      await updateUser({ email: data.email }, {password:hashedPassword})
  
      return success(res,{} ,"Password updated")
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error occurred while updating password' });
    }
}; 
  
exports.resendLink = async (req, res) => {
    const { ext } = req.query;
    getUserByVerificationtag(ext).then( async (data)=>{
  
      if (!data){
        return notFound(res, "Account not found")
      }
  
      const new_ext = await createVerificationTagForUser(data?.email)
  
      const token = generateToken({email:data?.email}, 1*5*60, process.env.ACC_VERIFICATION_KEY)
  
      // const verificationUri = backend_url+`/auth/verify?token=${token}`
      // const verificationUri = `https://lookupon.vercel.app/verification?token=${token}` // live
      const verificationUri = `http://localhost:3000/verification?token=${token}&ext=${new_ext}`
      const emailTemp = `<p>Click <a href="${verificationUri}">here</a> to verify your email.</p>`; // Adjust the email template as needed
      console.log("Account verification",data?.email, emailTemp)
      mailSend("Account verification",data?.email, emailTemp);
  
      return success(res, {}, "Link sent")
    }).catch((reason)=>{
      // console.log(reason)
      return generalError(res, "Unable to send verification Link")
    })
}
  
  