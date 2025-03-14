const { createNewSeminarDate, getSeminars, fetchAllTopics, fetchAllStudents, getActiveUserEmails } = require("../db/query")
const { PAGE_LIMIT } = require("../helpers/consts")
const { baseEmitter, baseEvents } = require("../helpers/emitters/base")
const { generalError, created, invalid, success } = require("../helpers/statusCodes")

exports.createSeminardate = async (req, res) =>{
    const scheduled_date = req?.body?.dateTime
    if (!scheduled_date){
        return generalError(res, "scheduled date and time required")
    }
    const session = req?.user?.session
    const date_ = new Date(scheduled_date)
    console.log("date::::", date_)
    try{
        await createNewSeminarDate(session, date_)
    }catch(error){
        console.log("error::::",error)
        return generalError(res, "Invalid date format. Required format : mm/dd/yy hh:mm am")
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