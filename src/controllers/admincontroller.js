const { fetchSpecificSession, createSession, logError, createUser, getUserByEmail, getAllUsers, updateSpecificUser, getUserByUniqueId, createCourse, updateCourse } = require("../db/query")
const sync = require("../db/sync")
const { P, PAGE_LIMIT } = require("../helpers/consts")
const { pExCheck, generateToken, generateUID, mailSend, pInCheck } = require("../helpers/util")
const { generalError, success, created, notFound, notModifiedError, notAcceptable } = require("./../helpers/statusCodes")
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

exports.createNewUser = async (req, res, next) => {
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
  try {
    await createUser(
      { designation, firstName, lastName, middleName, dept, userType, email, password: hashed, uid: "LC" + generateUID(15) }
    )
  } catch (error) {

    return generalError(res, "")
  }
  mailSend("Notice of Account Creation", email, emailTemp);

  return created(res, "Account Created")




}

exports.updateUserDetails = async (req, res, next) => {
  const user_id = req?.user?.uid

}

exports.fetchAllUsers = async(req, res, next) =>{
  // const user_id = req?.user?.uid
  let page = req?.query?.page ?? 1
  try{
    page = parseInt(page)
    page = page - 1
  }catch(error){
    console.log("error here::::",error)
  }

  const skip = PAGE_LIMIT * page

  const users = await getAllUsers(PAGE_LIMIT, skip)

  return success(res, {users}, "fetched")

}

exports.updateUserDetail = async (req, res, next) => {
  const user_id = req?.user?.uid  
  const idToBeUpdated = req?.query?.uid
  const not_required = pInCheck(req?.body, [P.first_name, P.last_name, P.middleName, P.designation, P.userType, P.email, P.phone])
  if (not_required.length > 0){
    return generalError(res, `Parameters not editable: ${not_required.toLocaleString()}`)
  }
  const acc = getUserByUniqueId(idToBeUpdated)
  if (!acc) {
    return notFound(res, "Account not found")
  }

  const update = await updateSpecificUser(idToBeUpdated, req?.body)

  if (!update){
    return notModifiedError(res)
  }
  return success(res, {}, "User detail updated.")

}

exports.createNewCourse = async (req, res, next) =>{
  const user_id = req?.user?.uid

  const missing = pExCheck(req?.body, [P.code, P.title])
  const unrequired = pInCheck(req?.body, [P.code, P.title])

  if (missing.length > 0){
    return generalError(res, `Missing fields: ${missing.toLocaleString()}`)
  }
  if (unrequired.length > 0){
    return notAcceptable(res, `Not acceptable fields: ${unrequired.toLocaleString()}`)
  }
  try{
    await createCourse(req?.body?.code, req?.body?.title)
  }catch(error){
    console.log("error::::", error)
    return generalError(res, "Error occured while creating courses, Kindly notify development team immediately")
  }

  return created(res, "Course added")

}

exports.updateExistingCourse = async(req, res, next) =>{
  const user_id = req?.user?.id
  const unrequired = pInCheck(req?.body, [P.code, P.title])
  const course_id = req?.query?.course_id

  if (!course_id){
    return generalError(res, "Kindly select a course to edit, course_id missing")
  }
  
  if (unrequired.length > 0){
    return notAcceptable(res, `Not acceptable fields: ${unrequired.toLocaleString()}` )
  }
  let updated
  try{
    updated = (await updateCourse(course_id, req?.body))[0]
  }catch(error){
    return generalError(res, "Unable to update course, Contact dev team")
  }

  if (!updated){
    return notModifiedError(res)
  }
  return success(res, {}, "Updated successfully")
}

// exports.deleteUser = async(req, res, next) =>{

// }
