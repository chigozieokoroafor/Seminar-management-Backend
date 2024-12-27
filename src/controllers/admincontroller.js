const { fetchSpecificSession, createSession, logError, createUser, getUserByEmail } = require("../db/query")
const sync = require("../db/sync")
const { P } = require("../helpers/consts")
const { pExCheck, generateToken, generateUID, mailSend } = require("../helpers/util")
const { generalError, success, created } = require("./../helpers/statusCodes")
const bcrypt = require("bcrypt");

exports.createNewSession = async (req, res, next) => {
  const user_id = req?.user?.uid

  const session = req?.body?.session

  if (!session) {
    return generalError(res, "Kindly provide a session: 20xx/20xy")
  }
  const session_exists = await fetchSpecificSession(session)
  if (session_exists) {
    return generalError(res, "Session Exists")
  }

  try {

    const promises = await Promise.allSettled([createSession(session), sync.admin_sync(session)])
    if (promises[1].status == "rejected") {
      await logError(promises[1].reason)
      return generalError(res, "Unable to sync new session, Kindly contact dev team")
    }

  } catch (error) {
    console.log("error:::: new session::::", error)
    generalError(res, "Error occured while creating new session environment")
    await logError(error.message)
  }

  return success(res, {}, "New session created")

}

exports.createnewUser = async (req, res, next) => {
  const user_id = req?.user?.uid
  const missing = pExCheck(req?.body, [P.designation, P.first_name, P.last_name, P.middleName, P.dept, P.userType, P.email])
  if (missing.length > 0) {
    return generalError(res, `Missing fields: ${missing?.toLocaleString()}`)
  }
  const { designation, firstName, lastName, middleName, dept, userType, email } = req?.body

  const userExists = await getUserByEmail(email)
  if (userExists) {
    return generalError(res, "User with email exists")
  }
  const password = generateUID(7)

  const hashed = bcrypt.hashSync(password, 13)
  const base_url = "https://google.com"
  const emailTemp = `<p>An account has been created on SeMaSy <br> Find below your credentials and a link to access your account  <br> email: ${email}, password: ${password} <br> <br> click <a href="${base_url}">here</a> to login.</p>`; // Adjust the email template as needed
  try{
    await createUser(
      { designation, firstName, lastName, middleName, dept, userType, email , password:hashed, uid: "LC"+generateUID(15)}
    )
  }catch(error){

    return generalError(res, "")
  }
  mailSend("Account verification", email, emailTemp);

  return created(res, "Account Created")




}