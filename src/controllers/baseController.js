const { fetchAllCourses, fetchSessions } = require("../db/query")
const { success } = require("../helpers/statusCodes")

exports.getAllCourses = async (req, res, next) => {
    const courses = await fetchAllCourses()
    return success(res, { courses }, "fetched")
}

exports.getSessions = async(req, res, next) =>{
    const sessions = await fetchSessions()
    return success(res, {sessions}, "fetched")
}
exports.registerCourses = async (req, res, next) => {

}