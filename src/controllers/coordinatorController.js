const { createNewSeminarDate, getSeminars, fetchAllTopics, fetchAllStudents, getActiveUserEmails } = require("../db/query")
const { PAGE_LIMIT, P } = require("../helpers/consts")
const { baseEmitter, baseEvents } = require("../helpers/emitters/base")
const { generalError, created, invalid, success } = require("../helpers/statusCodes")
const { pExCheck } = require("../helpers/util")

exports.createSeminardate = async (req, res) =>{
    
    const missing = pExCheck(req?.body, [P.datetime])

    if (missing.length > 0){
        return generalError(res, `Missing fields: ${missing.toLocaleString()}`)
    }
    const session = req?.user?.session
    let proposed_date
    try{
        proposed_date = new Date(req.body[P.datetime]).toISOString()
    }catch(error){
        console.log("error::::",error)
        return generalError(res, "Invalid date format. Required format : yyyy/mm/dd hh:mm:ss")
    }
    
    const [date, time] = proposed_date.split("T")
    try{
        await createNewSeminarDate(session, date, time)
    }catch(error){
        console.log("error::::",error)
        if (error.name == "SequelizeUniqueConstraintError")return generalError(res, "Seminar date exists")
        return generalError(res, "Invalid date format. Required format : yyyy/mm/dd hh:mm:ss")
    }
    return created(res, "New seminar date added") 
}

exports.getAllSeminars = async(req, res) =>{
    const session = req?.query?.session ?? req?.user?.session 
    const page = req?.query?.page
    if (!page || page == 0){
        return generalError(res, "invalid page parameter")
    }
    const data  = await getSeminars(session, PAGE_LIMIT, (Number(page) - 1 ) * PAGE_LIMIT)
    return success(res, data, "fetched")
}

exports.getAllTopics = async(req, res) =>{
    const data = await fetchAllTopics()
    return success(res, data, "fetched")
}

exports.viewstudentList = async(req, res) =>{
    const data = await fetchAllStudents(10, 0)
    return success(res, data)
}

exports.sendOutSeminarInvite = async(req, res) =>{
    const user_id = req?.user?.uid

    // console.
    const date = new Date().toUTCString()
    const name = `${req?.user?.designation}. ${req?.user?.firstName} ${req?.user?.lastName}`

    // getSeminars for seminar list
    
    const emails_ = await getActiveUserEmails()
    const emailsList = emails_.map((email)=>{return email.email})
    baseEmitter.emit(baseEvents.newSeminar, emailsList?.toString())

    return success(res, {date, name}, "working on seminar invite")
    
    
}