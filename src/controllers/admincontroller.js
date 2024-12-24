const {generalError, success} = require("./../helpers/statusCodes")

exports.createNewSession = async(req, res, next) =>{
  const user_id = req?.user?.uid 


  const session = req?.body?.session

  if (!session){
    return generalError(res, "Kindly provide a session: 20xx/20xy")
  }
  return success(res, {}, "working")
  
} 

exports.createAdmin = async(req, res, next) =>{
  req?.user
}