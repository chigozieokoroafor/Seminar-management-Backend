const { registerSeminar, logError, validateSeminarExists, updateSeminarForReg, getSeminarRegistrationForSpecificUser, getFeedbackForForm, getSpecificSeminarRegistrationById, updateSpecificSeminarRegistration, uploadDocumentDataForForm, deleteRegistration, getAllSeminarApplicationsForUser, updateDocumentData } = require("../db/query")
const { P } = require("../helpers/consts")
const { errorEmitter, errorEvents } = require("../helpers/emitters/errors")
const { generalError, success, internalServerError, notFound } = require("../helpers/statusCodes")
const { pInCheck, pExCheck, Google } = require("../helpers/util")
const getIp = require("ipware")().get_ip

exports.getProfile = async (req, res, next) => {
    const user_id = req?.user?.uid
    console.log
}

exports.getUserDataForHomePage = async (req, res, next) => {
    // const user_id = req?.user?.uid
    // console.log(req?.user)
    const { firstName, lastName, isActive } = req?.user
    req.user = {}
    return success(res, { firstName, lastName, isActive }, "success")
}

exports.updateProfile = async (req, res, next) => {

}

exports.initiateSeminarRegistration = async (req, res) => {
    const user_id = req?.user?.uid
    const not_required = pInCheck(req?.body, [P.seminarType, P.title, P.programType])
    if (not_required?.length > 0) {
        return generalError(res, `Un required parameters: ${not_required?.toLocaleString()}`)
    }

    const missing = pExCheck(req?.body, [P.seminarType, P.title, P.programType, P.file])
    if (missing?.length > 0) {
        return generalError(res, `Missing parameters: ${missing?.toLocaleString()}`)
    }

    if (!req?.user?.supervisor) {
        return generalError(res, "No supervisor attached, Kindly request a supervisor to add you as his/her student.")
    }

    let isNew = true

    const data = {
        sid: user_id,
        detail: { title: req?.body?.title, programType: req?.body[P.programType] },
        seminarType: req?.body[P.seminarType],
        session: req?.user?.session,
        lid: req?.user?.supervisor
    }
    
    isNew = await validateSeminarExists(data) ? false : true

    let form_Id

    try {
        if (isNew) { 
            const new_seminar = await registerSeminar(data) 
            form_Id = new_seminar?.id
            const filename = req?.body?.title.replaceAll(" ", "_")
            const google = new Google
            const g_resp = await google.uploadFile(req?.file?.buffer, req?.file?.mimetype, filename)
            const doc_data = {
                fid:new_seminar?.id,
                filename:filename + "." +req?.file?.originalname.split(".")[1],
                gid: g_resp?.id, 
                url: g_resp?.webViewLink, 
                session: data.session
            }
            await uploadDocumentDataForForm(doc_data)
        }
        else { updateSeminarForReg(data, { isSupervisorPending: true, isSupervisorApproved: false, isCoordinatorPending: false, isCoordinatorApproved: false }) }
    } catch (error) {
        await logError(error?.message, "initiateSeminarRegistration")
        await deleteRegistration(form_Id)
        
        return internalServerError(res, "Unable to register, internal server error")
    }
    return success(res, {}, "success")

}

exports.getSingleSeminarApplication = async (req, res) => {
    try{
        const user_id = req?.user?.uid
        const missing = pExCheck(req?.query, [P.fid])
        if (missing.length > 0){
            return generalError(res, `Missing query params: ${missing.toLocaleString()}`)
        }
        const data = (await getSeminarRegistrationForSpecificUser(user_id,req?.query?.fid ))[0]
        // console.log("data:::", data)

        if(!data){
            return success(res, {form:{}, feedback:{}}, "No registrations found")
        }
        try{
            const feedback = (await getFeedbackForForm(data?.id, req?.user?.session))
            data.feedback = feedback
            // return success(res, { form: data, feedback: feedback?feedback : {} })
            return success(res, { application: data, feedback: feedback? feedback : {} })
        }catch(err){
            return success(res, { application: data, feedback: {} })
        }
        
    }catch(error){
        await logError(error?.message, "getSingleSeminarApplication", req?.user?.session)
        return internalServerError(res, "unable to get registrations at current time")
    }
}

exports.getSeminarApplicationList = async(req, res) => {
    try{
        const user_id = req?.user?.uid

        const data = await getAllSeminarApplicationsForUser(user_id, req?.user?.session)
        // console.log("data:::", data)

        if(!data){
            return success(res, {form:{}, feedback:{}}, "No registrations found")
        }
        // try{
        //     const feedback = (await getFeedbackForForm(data?.id, req?.user?.session))
        //     return success(res, { form: data, feedback: feedback?feedback : {} })
        // }catch(err){
        return success(res, { applications: data })
        // }
        
    }catch(error){
        console.log("error:::",error)
        await logError(error?.message, "getSeminarApplicationList", req?.user?.session)
        return internalServerError(res, "unable to get registrations at current time")
    }
}

exports.updateSeminarRegistration = async (req, res) => {
    try {
        const user_id = req?.user?.uid
        const missing = pExCheck(req?.query, [P.id]) //here, sid is the seminar DId
        if (missing?.length > 0) {
            return generalError(res, `Missing required query param: ${missing?.toLocaleString()}`)
        }

        const not_required = pInCheck(req?.body, [P.seminarType, P.title, P.programType])
        if (not_required?.length > 0) {
            return generalError(res, `Unrequired fields: ${not_required?.toLocaleString()}`)
        }
        const data = await getSpecificSeminarRegistrationById(user_id, req?.query?.id)
        console.log("data:::", data)
        if (data?.length < 1) {
            return notFound(res, "Selected registration not found")
        }
        let detail = [`${P.isSupervisorPending}= 1`,`${P.isSupervisorApproved}=0`,`${P.isCoordinatorPending} = 0`, `${P.isCoordinatorApproved} = 0, ${P.status}=0`] 
        const { title, programType, seminarType } = req?.body

        if (seminarType) {
            detail.push(`${P.seminarType} = '${seminarType}' `)
        }

        if (title && !programType) {
            detail.push(`detail = JSON_SET(${P.detail}, '$.${P.title}', '${title}')`)
        } else if (programType && !title) {
            detail.push(`detail = JSON_SET(${P.detail}, '$.${P.programType}', '${programType}')`)
        } else if (programType && title) {
            detail.push(`detail = JSON_SET(${P.detail}, '$.${P.programType}', '${programType}', '$.${P.title}', '${title}')`)
        }
        // detail = JSON_SET(detail, '$.key', 'new_value')
        const update_query = detail?.toLocaleString()
        const update_ = await updateSpecificSeminarRegistration(req?.query?.id, update_query)
        success(res, {}, "updated successfully")

        if (req?.file){
            try {
                console.log("data[0:::]::::", data[0])
                const filename = title?.replaceAll(" ", "_") ?? data[0]?.detail?.title.replaceAll(" ", "_")
                const google = new Google
                const del = await google.deleteFile(data[0].gid)
                console.log("del::::", del)
                const g_resp = await google.uploadFile(req?.file?.buffer, req?.file?.mimetype, filename)
                console.log("g.resp:::", g_resp)
                const doc_data = {
                    // fid:new_seminar?.id,
                    filename:filename + "." +req?.file?.originalname.split(".")[1],
                    gid: g_resp?.id, 
                    url: g_resp?.webViewLink, 
                    session: data.session
                }
                await updateDocumentData(req?.query?.id, doc_data)
            }catch(error){
                console.log("error::::", error)
            }
        }
        // console.log(update_)

        
        // add a notification at this point. to supervisors (event trigger.)
        


    } catch (error) {
        console.log(error)
        await logError(error?.message, "updateSeminarRegistration", req?.query?.id)
        return internalServerError(res, "Unable to update registration at current time")
    }

}
// this is next()work on the location based thing.
exports.markAttendance = async (req, res) =>{
    try{ 
        const missing = pExCheck(req.body, [P.sid, P.token]) //sid - seminarId, token- token pin.
        if (missing.length > 0){    
            return generalError(res, `Missing fields: ${missing?.toLocaleString()}`)
        }
        
    }catch(error){
        errorEmitter.emit(errorEvents.err, error.message, error.stack, user, session)
    }
}

exports.uploadFile = async (req, res) =>{
    // console.log("body:::", req)
    

    return success(res, {}, "testing")
}

// issues with geolocation api, currentyl stumped
// exports.getIP = async(req, res) =>{
//     console.log(req.headers)
//     // console.log ("ip:::",getIp(req))
//     // console.log(req.socket?.remoteAddress)
//     success(res, {}, "asda")
//     console ("location:::",window.location.origin)
// }


