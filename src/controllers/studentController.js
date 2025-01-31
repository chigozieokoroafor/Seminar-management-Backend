const { P } = require("../helpers/consts")
const { generalError, success } = require("../helpers/statusCodes")
const { pInCheck } = require("../helpers/util")

exports.getProfile = async(req, res, next) =>{
    const user_id = req?.user?.uid 
    console.log
}

exports.getUserDataForHomePage = async(req, res, next) =>{
    const user_id = req?.user?.id
    console.log("user:::", req?.user)
    return success(res, {}, "working on shit")
}

exports.updateProfile = async(req, res, next) =>{

}

exports.initiateSeminarRegistration = async (req, res ) =>{
    const user_id = req?.user?.id 
    const not_required = pInCheck(req?.body, [P.seminarType, P.title, P.programType])
    if (not_required?.length > 0){
        return generalError(res,  `Un required parameters: ${not_required?.toLocaleString()}`)
    }
    
}

