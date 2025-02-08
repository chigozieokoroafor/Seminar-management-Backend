const { registerSeminar, logError, validateSeminarExists, updateSeminarForReg, getSeminarRegistrationForSpecificUser, getFeedbackForForm, getSpecificSeminarRegistrationById, updateSpecificSeminarRegistration } = require("../db/query")
const { P } = require("../helpers/consts")
const { generalError, success, internalServerError, notFound } = require("../helpers/statusCodes")
const { pInCheck, pExCheck } = require("../helpers/util")

exports.getProfile = async(req, res, next) =>{
    const user_id = req?.user?.uid 
    console.log
}

exports.getUserDataForHomePage = async(req, res, next) =>{
    // const user_id = req?.user?.uid
    // console.log(req?.user)
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
    // console.log(data[0])
    const feedback = (await getFeedbackForForm(data[0]?.id, req?.user?.session))
    return success(res, {form: data[0], feedback })
}

exports.updateSeminarRegistration = async (req, res)=>{
    try{
        const user_id = req?.user?.uid
        const missing = pExCheck(req?.query, [P.id]) //here, sid is the seminar DId
        if (missing?.length > 0){
            return generalError(res, `Missing required query param: ${missing?.toLocaleString()}`)
        }

        const not_required = pInCheck(req?.body, [P.seminarType, P.title, P.programType])
        if (not_required?.length > 0){
            return generalError(res, `Unrequired fields: ${not_required?.toLocaleString()}`)
        }
        const data = await getSpecificSeminarRegistrationById(user_id, req?.query?.id)
        if (!data){
            return notFound(res, "Selected registration not found")
        }
        let detail = ""
        const {title, programType, seminarType} = req?.body
        
        if(seminarType){
            detail = detail + `${P.seminarType} = '${seminarType}' , `
        }

        if (title && !programType){
            detail = detail + `detail = JSON_SET(${P.detail}, '$.${P.title}', '${title}')`
        }else if (programType && !title){
            detail = detail + `detail = JSON_SET(${P.detail}, '$.${P.programType}', '${programType}')`
        }else{
            detail = detail + `detail = JSON_SET(${P.detail}, '$.${P.programType}', '${programType}', '$.${P.title}', '${title}')`
        }
        // detail = JSON_SET(detail, '$.key', 'new_value')
        const update_ = await updateSpecificSeminarRegistration(req?.query?.id, detail)
        console.log(update_)

        return success(res, {}, "updated successfully")
        // add a notification at this point. to supervisors (event trigger.)

        
    }catch(error){
        console.log(error)
        await logError(error?.message, "updateSeminarRegistration", req?.query?.id)
        return internalServerError(res, "Unable to update registration at current time")
    }
    
}

