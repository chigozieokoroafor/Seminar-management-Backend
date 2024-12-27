const { fetchAllCourses } = require("../db/query")
const { success } = require("../helpers/statusCodes")

exports.getAllCourses = async (req, res, next) => {
    const courses = await fetchAllCourses()
    return success(res, { courses }, "fetched")
}

exports.registerCourses = async (req, res, next) => {
    
}