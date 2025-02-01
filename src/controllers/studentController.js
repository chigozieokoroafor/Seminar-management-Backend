const { registerSeminar, logError, validateSeminarExists, updateSeminarForReg, getSeminarRegistrationForSpecificUser, getFeedbackForForm } = require("../db/query")
const { P } = require("../helpers/consts")
const { generalError, success, internalServerError } = require("../helpers/statusCodes")
const { pInCheck, pExCheck } = require("../helpers/util")

exports.getProfile = async(req, res, next) =>{
    const user_id = req?.user?.uid 
    console.log
}

exports.getUserDataForHomePage = async(req, res, next) =>{
    // const user_id = req?.user?.uid
    console.log(req?.user)
    const {firstName, lastName, isActive} = req?.user
    req.user = {}
    return success(res, {firstName, lastName, isActive}, "success")
}

exports.updateProfile = async(req, res, next) =>{

}

exports.initiateSeminarRegistration = async (req, res ) =>{
    const user_id = req?.user?.uid 
    const not_required = pInCheck(req?.body, [P.seminarType, P.title, P.programType])
    if (not_required?.length > 0){
        return generalError(res,  `Un required parameters: ${not_required?.toLocaleString()}`)
    }

    const missing = pExCheck(req?.body, [P.seminarType, P.title, P.programType])
    if (missing?.length > 0){
        return generalError(res,  `Missing parameters: ${missing?.toLocaleString()}`)
    }

    if(!req?.user?.supervisor){
        return generalError(res, "No supervisor attached, Kindly request a supervisor to add you as his/her student.")
    }

    let isNew = true

    const data = {
        sid:user_id,
        detail:{title: req?.body?.title,programType: req?.body[P.programType] } ,
        seminarType: req?.body[P.seminarType],
        session: req?.user?.session,
        lid:req?.user?.supervisor
    }

    isNew = await validateSeminarExists(data) ? false: true

    try{
        if (isNew){await registerSeminar(data)}
        else{updateSeminarForReg(data, {isSupervisorPending:true, isSupervisorApproved:false, isCoordinatorPending:false, isCoordinatorApproved:false })}
    }catch(error){
        await logError(error?.message, "initiateSeminarRegistration")
        return internalServerError(res, "Unable to register, internal server error")
    }
    return success(res, {}, "success")

}

exports.getSeminarRegistrations = async(req, res) =>{
    const user_id = req?.user?.uid
    
    const data = await getSeminarRegistrationForSpecificUser(user_id, req?.user?.session)
    console.log(data[0])
    const feedback = (await getFeedbackForForm(data[0]?.id, req?.user?.session))
    return success(res, {form: data[0], feedback })
}

exports.updateSeminarRegistration = async (req, res)=>{
    const user_id = req?.user?.uid

}

