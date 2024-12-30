const bcrypt = require("bcrypt");
const { backend_url, destructureToken, mailSend, generateToken, reVerificationTag, getStudentDetailFronTrackNetque, pExCheck, generateUID, TOKEN_KEYS } = require('../helpers/util');
// const { createUser, getUser, updateUser, getUserByVerificationtag, createVerificationTagForUser } = require('../db/query');
const { success, notAcceptable, notFound, invalid, internalServerError, generalError, exists, expired, created } = require('../helpers/statusCodes');
const { studentAccountCreatorValidator } = require('../helpers/validator');
const { P } = require("../helpers/consts");
const { getStudentByFormId, registerStudent, verifyUser, getUserByEmail, fetchUserForSignin } = require("../db/query");





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

  const userExists = await getStudentByFormId(req?.body?.formId)

  if (userExists){
    return generalError(res, "User exists")
  }

  const detail = await getStudentDetailFronTrackNetque(req?.body?.formId, req?.body?.surname)
  if (!detail?.success) return generalError(res, "Kindly check details provided")
  
  return success(res, detail?.data, "Valid")
}

exports.createAccountStudent = async(req, res) =>{
  const missing = pExCheck(req?.body, [P.formId, P.name, P.email, P.dept, P.program, P.session, P.password, P.matricNo])
  if (missing.length > 0) {
    return generalError(res, `Missing fields: ${missing.toLocaleString()}`)
  }

  const userExists = await getStudentByFormId(req?.body?.formId)

  if (userExists){
    return generalError(res, "User exists")
  }

  const names = req?.body?.name?.split(" ")
  const user_id = generateUID(20)
  const hashed_pwd = bcrypt.hashSync(req?.body?.password, 10)

  const user_data = {
    uid:user_id,
    firstName:names[1],
    lastName:names[0],
    middleName:names[2],
    email:req?.body?.email,
    phone:req?.body?.phone,
    password:hashed_pwd
  }

  const student_data = {
    matricNo:req?.body?.matricNo,
    sid:user_id,
    program: req?.body?.program,
    netqueFormId:req?.body?.formId,
    session:req?.body?.session
  }

  const email = req?.body?.email

  const x = await registerStudent(user_data, student_data)

  const token = generateToken({uid:user_id}, 1*5*60, process.env.AUTH_KEY)
  
  const verificationUri = backend_url+`/auth/verify?token=${token}`
  // const verificationUri = `${backend_url}/verification?token=${token}&ext=${ext}`
  const emailTemp = `<p>Click <a href="${verificationUri}">here</a> to verify your email.</p>`; // Adjust the email template as needed
  mailSend("Account verification",email, emailTemp);
  
  return success(res, {}, "Account created")

}

  
// Sign In
exports.signin =async (req, res) => {
    const { email, password, session} = req.body;
  
    if (!email || !password) {
      // return res.status(406).json({ msg: 'Email and password fields required' });
      return notAcceptable(res, 'Email and password fields required')
    }

    if (!session){
      return notAcceptable(res, "Specific session required")
    }
  
    try {
      const user = await getUserByEmail(email)
  
      if (!user) {
        // return res.status(404).json({ msg: "Account with credentials provided doesn't exist" });
        return notFound(res, "Account with credentials provided doesn't exist")
      }
  
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        // return res.status(401).json({ msg: 'Invalid password' });
        return generalError(res, "Invalid credentials")
      }
      // console.log("verified:::", !user?.isVerified)
      if (!user?.isVerified){
        const token = generateToken({uid:user?.uid, type:user?.userType}, 1*5*60, process.env.AUTH_KEY)
  
        const verificationUri = backend_url+`/auth/verify?token=${token}`
        // const verificationUri = `${backend_url}/verification?token=${token}&ext=${ext}`
        const emailTemp = `<p>Click <a href="${verificationUri}">here</a> to verify your email.</p>`; // Adjust the email template as needed
        mailSend("Account verification",email, emailTemp);
        return created(res, "Verification link sent, kindly verify to proceed")
      }
      const auth_token = TOKEN_KEYS[user?.userType]
      
      const token = generateToken({ uid: user.uid, userType: user?.userType, session: session}, 1*600*60, auth_token);
      return success(res, {token}, "")
    } catch (error) {
      console.error(error);
      return internalServerError(res, 'Error occurred while signing in')
    }
};
  
  
// Verify Email
exports.verify = async (req, res) => {
    const { token } = req.query;
  
    const data = destructureToken(token, process.env.AUTH_KEY);
    if (!data) {
      // return res.status(410).json({ msg: 'Verification Link expired, Kindly request for another to verify account' });
      return expired(res, "Verification Link Expired")
    }

    const uid = data?.uid
  
    try {
      const update = await verifyUser(uid)
      return success(res, {}, "Verified")
    } catch (error) {
      console.error("error on verify::::",error);
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
  
// exports.resendLink = async (req, res) => {
//     const { ext } = req.query;
//     getUserByVerificationtag(ext).then( async (data)=>{
  
//       if (!data){
//         return notFound(res, "Account not found")
//       }
  
//       const new_ext = await createVerificationTagForUser(data?.email)
  
//       const token = generateToken({email:data?.email}, 1*5*60, process.env.ACC_VERIFICATION_KEY)
  
//       // const verificationUri = backend_url+`/auth/verify?token=${token}`
//       // const verificationUri = `https://lookupon.vercel.app/verification?token=${token}` // live
//       const verificationUri = `http://localhost:3000/verification?token=${token}&ext=${new_ext}`
//       const emailTemp = `<p>Click <a href="${verificationUri}">here</a> to verify your email.</p>`; // Adjust the email template as needed
//       console.log("Account verification",data?.email, emailTemp)
//       mailSend("Account verification",data?.email, emailTemp);
  
//       return success(res, {}, "Link sent")
//     }).catch((reason)=>{
//       // console.log(reason)
//       return generalError(res, "Unable to send verification Link")
//     })
// }
  
  