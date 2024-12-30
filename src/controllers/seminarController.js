const { getSeminars } = require("../db/query")

exports.viewActiveSeminars = async(req, res, next) =>{
    const session = req?.user?.session
    data = getSeminars(session, 2)
    return data
}


exports.markAttendance = async(req, res, next) =>{

}