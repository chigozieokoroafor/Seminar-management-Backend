const { getSeminarRegistrationBySupervisor, updateFormRegistration, getSpecificSeminarRegBySupervisor, createFeedback, logError } = require("../db/query")
const { P } = require("../helpers/consts")
const { success, generalError, notFound } = require("../helpers/statusCodes")
const { pExCheck, pInCheck } = require("../helpers/util")

exports.getRegistrations = async (req, res) => {
    const user_id = req?.user?.uid
    const data = await getSeminarRegistrationBySupervisor(user_id)

    return success(res, data, "fetched")

}

// exports.getFile = async (req, res) => {
//     // to download documents
// }

exports.approveDisprove = async (req, res) => {
    const user_id = req?.user?.uid

    const notRequired = pInCheck(req?.body, [P.fid, P.status, P.feedback])
    if (notRequired.length > 0) {
        return generalError(res, `unreqquired fields: ${notRequired.toLocaleString()}`)
    }

    const missing = pExCheck(req?.body, [P.fid, P.status])
    if (missing.length > 0) {
        return generalError(res, `Missing fields: ${missing.toLocaleString()}`)
    }

    const { fid, status, feedback } = req?.body
    if (status != "approve" && !feedback) {
        return generalError(res, "Feedback required before rejection ")
    }

    const exists = await getSpecificSeminarRegBySupervisor({ id: fid, lid: user_id })
    if (!exists) {
        return notFound(res, "Record not found.")
    }

    const specReg = exists?.toJSON()

    let update_query = {}
    const promises = []

    if (status == approve) {
        update_query.status = 1
    } else {
        update_query.status = 3
        promises.push(createFeedback({ lid: user_id, sid: specReg?.sid, fid: fid, feedback: feedback }, specReg?.session))
    }

    promises.unshift(updateFormRegistration({ id: fid, lid: user_id }, { isSupervisorPending: false, isSupervisorApproved: req?.body?.approve }))

    const fulfiled = await Promise.allSettled(promises)


    if (fulfiled[0].status == "rejected"){
        await logError(fulfiled[0].reason)
        return generalError(res, "Unable to make edits at current time. ")
    }
    return success(res, {}, `Application ${req?.body?.status}d. `)

} 