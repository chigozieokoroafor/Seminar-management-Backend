const { getSeminars, getPresentersOnDay } = require("../db/query")
const { PAGE_LIMIT } = require("../helpers/consts")
const { generalError, success } = require("../helpers/statusCodes")
const { getUpcomingSeminarDates, getAllSeminars } = require("../db/query")
const { pExCheck, pInCheck } = require("../helpers/util")

exports.viewActiveSeminars = async(req, res, next) =>{
    const session = req?.user?.session
    data = getSeminars(session, 2)
    return data
}


exports.markAttendance = async(req, res, next) =>{

}

// exports.getAllSeminars = async(req, res) =>{
//     const session = req?.query?.session ?? req?.user?.session 
//     const page = req?.query?.page
//     if (!page || page == 0){
//         return generalError(res, "invalid page parameter")
//     }
//     const data  = await getSeminars(session, PAGE_LIMIT, (Number(page) - 1 ) * PAGE_LIMIT)
//     return success(res, data, "fetched")
// }

exports.getSeminarsFromToday = async(req, res) =>{
    // get all seminars with
    const session = req?.user?.session
    const limit = 5
    const offset = 0 // t be 5
    const seminars = await getUpcomingSeminarDates(limit, offset)

    for (let i = 0; i < seminars.length; i++) {
        const seminar = seminars[i];
        // for each seminar date, get presenters under them.
        // const {no_on_queue, detail, name}  = (await getPresentersOnDay(seminar.id))
        const item  = (await getPresentersOnDay(seminar.id))
        seminar.presenters = item
        // console.log(seminar)
        seminars[i] = seminar
        
        // console.log(`here:::${i}`, item)
        
    }

    return success(res, seminars, "Fetched")
}

exports.getSeminars = async(req, res) => {
    const session = req?.user?.session
    const limit = 5
    const offset = 0 // t be 5
    const seminars = await getAllSeminars(limit, offset)
    for (let i = 0; i < seminars.length; i++) {
        const seminar = seminars[i];
        // for each seminar date, get presenters under them.
        // const {no_on_queue, detail, name}  = (await getPresentersOnDay(seminar.id))
        const item  = (await getPresentersOnDay(seminar.id))
        seminar.presenters = item
        // console.log(seminar)
        seminars[i] = seminar
        
        // console.log(`here:::${i}`, item)
        
    }
    return success(res, seminars, "Fetched")
}