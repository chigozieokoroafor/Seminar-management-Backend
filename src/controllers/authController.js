const bcrypt = require("bcrypt");
const { backend_url, destructureToken, mailSend, generateToken, reVerificationTag, getStudentDetailFronTrackNetque, pExCheck, generateUID, TOKEN_KEYS } = require('../helpers/util');
// const { createUser, getUser, updateUser, getUserByVerificationtag, createVerificationTagForUser } = require('../db/query');
const { success, notAcceptable, notFound, invalid, internalServerError, generalError, exists, expired, created, redirect } = require('../helpers/statusCodes');
const { studentAccountCreatorValidator } = require('../helpers/validator');
const { P, USER_TYPES} = require("../helpers/consts");
const { getStudentByFormId, registerStudent, verifyUser, getUserByEmail, fetchUserForSignin, updateSpecificUser, updateUserByEmail, logError, getUserByEmailRaw } = require("../db/query");

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

  const [studentExists, userExists] = await Promise.allSettled([getStudentByFormId(req?.body?.formId), getUserByEmail(req?.body?.email)])

  if(studentExists.status== "rejected" || userExists.status == "rejected"){
    console.log("studentUserCheck ::::", studentExists, userExists)
    return generalError(res, "unable to validate")
  }
  if (studentExists.value || userExists.value){
    return generalError(res, "User exists: email or formId exists")
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
      // const user = await getUserByEmail(email)
      const user = (await getUserByEmailRaw(email))[0]
      // console.log("user:::", user)
  
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
      let {firstName, lastName, middleName, program, isActive, matricNo} = user
      const token = generateToken({ uid: user.uid, userType: user?.userType, session: session}, 1*600*60, auth_token);
      return success(res, {token, userType: USER_TYPES[user?.userType], userDetail:{firstName, lastName, middleName, program, isActive, matricNo}}, "")
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
      const url = process.env.FRONTEND_URL+'/login'
      return redirect(res, url)
    } catch (error) {
      console.error("error on verify::::",error);
      res.status(500).json({ msg: 'Error occurred while verifying account' });
    }
};
  
// Send Password Reset Email
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email){
      return generalError(res, "Email required")
    }
    try {
      const user = getUserByEmail(email)
      if (!user) {
        // return res.status(404).json({ msg: 'Account with email not found' });
        return notFound(res, "Account with mail not found")
      }
      
      const token = generateToken({ email }, 1*5*60, process.env.PWD_RESET_KEY);
      // const PWD_RESET_URL = `https://lookupon.vercel.app/reset-password?token=${token}`
      const PWD_RESET_URL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`
      const emailTemp = `<p>Click <a href="${PWD_RESET_URL}">here</a> to reset your password.</p>`; // Adjust the email template as needed
      const mailSent =  mailSend('Password Reset Request',email, emailTemp);
      
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
    // console.log("data::: here:::", data)
    if (!data) {
      return expired(res, "Verification link expired")
      // return res.status(410).json({ msg: 'Token expired' });
    }
  
    if (!password) {
      return generalError(res, "New password required")
      // return res.status(412).json({ msg: 'New password required', "success":false});
    }
  
    try {
      const hashedPassword = bcrypt.hashSync(password, 8);
      await updateUserByEmail(data.email, {password:hashedPassword})
  
      return success(res,{} ,"Password updated")
    } catch (error) {
      console.error(error);
      return internalServerError(res, 'Error occurred while updating password')
      // res.status(500).json({ msg: 'Error occurred while updating password' });
    }
}; 
  
exports.resendLink = async (req, res) => {
  try{
    const { email } = req.query;
    if (!email){
      return generalError(res, "Email required")
    }
    // getUserByVerificationtag(ext).then( async (data)=>{
    const user = getUserByEmail(email)
    if (!user){
      return notFound(res, "Account not found")
    }
  
    // const new_ext = await createVerificationTagForUser(data?.email)
  
    // const token = generateToken({email:email}, 1*5*60, process.env.AUTH_KEY)

    const token = generateToken({uid:user?.uid, type:user?.userType}, 1*5*60, process.env.AUTH_KEY)
  
    const verificationUri = backend_url+`/auth/verify?token=${token}`
    // const verificationUri = `${backend_url}/verification?token=${token}&ext=${ext}`
    const emailTemp = `<p>Click <a href="${verificationUri}">here</a> to verify your email.</p>`; // Adjust the email template as needed
    mailSend("Account verification",email, emailTemp);
      // const verificationUri = backend_url+`/auth/verify?token=${token}`
      // const verificationUri = `https://lookupon.vercel.app/verification?token=${token}` // live
      // mailSend("Account verification",data?.email, emailTemp);
  
    return success(res, {}, "Link sent")

    // }).catch((reason)=>{
    //   // console.log(reason)
    //   return generalError(res, "Unable to send verification Link")
    // })
  }catch(error){
    await logError(error?.message, "verificationUri", "None")
    return generalError(res, "Unable to generate verification mail")
  }
}
  
  