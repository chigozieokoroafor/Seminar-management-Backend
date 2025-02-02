const { getSeminarRegistrationBySupervisor, updateFormRegistration } = require("../db/query")
const { P } = require("../helpers/consts")
const { success, generalError } = require("../helpers/statusCodes")
const { pExCheck, pInCheck } = require("../helpers/util")

exports.getRegistrations = async(req, res) => {
    const user_id = req?.user?.uid
    const data = await getSeminarRegistrationBySupervisor(user_id)

    return success(res, data, "fetched")

}

exports.getFile = async(req, res) =>{
    // to download documents
}

exports.approveDisprove = async(req, res) =>{
    const user_id = req?.user?.uid
    const notRequired = pInCheck(req?.body, [P.fid, P.approve])
    if (notRequired.length > 0){
        return generalError(res, `unreqquired fields: ${notRequired.toLocaleString()}`)
    }

    const missing = pExCheck(req?.body, [P.fid, P.approve])
    if (missing.length > 0){
        return generalError(res, `Missing fields: ${missing.toLocaleString()}`)
    }

    const update = await updateFormRegistration({id:req?.body?.fid, lid:user_id}, {isSupervisorPending:false, isSupervisorApproved: req?.body?.approve})
    if (!update[0] ){
        return generalError(res, "student application not found")
    }
    return success(res, {}, `Application ${req?.body?.approve ? "approved" : "disproved"}`)

}