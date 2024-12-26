const { fetchSpecificSession, createSession, logError } = require("../db/query")
const sync = require("../db/sync")
const {generalError, success} = require("./../helpers/statusCodes")

exports.createNewSession = async(req, res, next) =>{
  const user_id = req?.user?.uid 

  const session = req?.body?.session

  if (!session){
    return generalError(res, "Kindly provide a session: 20xx/20xy")
  }
  fetchSpecificSession(session).then(data =>{
    if (data){
      return generalError(res, "Session Exists")
    }
  })
  try{

    const promises = await Promise.allSettled([createSession(session), sync.admin_sync(session)])
    if (promises[1].status == "rejected"){
      await logError(promises[1].reason)
      return generalError(res, "Unable to sync new session, Kindly contact dev team")
    }

  }catch(error){
    console.log("error:::: new session::::", error)
    generalError(res, "Error occured while creating new session environment")
    await logError(error.message)
  }

  return success(res, {}, "New session created")
  
} 

exports.createAdmin = async(req, res, next) =>{
  req?.user
}