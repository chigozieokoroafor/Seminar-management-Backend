const { Router } = require("express");
const { createNewSession, createNewUser, fetchAllUsers, updateUserDetail, createNewCourse } = require("./src/controllers/admincontroller");
const { createAccountStudent, getstudentDetailFronNetQue, verify, signin } = require("./src/controllers/authController");
const { getAllCourses, getSessions } = require("./src/controllers/baseController");
const { studentAuth, adminAuth, supAuth, coordAuth } = require("./src/helpers/middleware");
const { createSeminardate, getAllSeminars, getAllTopics, viewstudentList, sendOutSeminarInvite } = require("./src/controllers/coordinatorController");

const router = Router();

// for admin
// router.get()
router.post("/admin/session/create", createNewSession)
router.post("/admin/user/create", adminAuth, createNewUser)
router.get("/admin/users/fetch", supAuth, fetchAllUsers)
router.put("/admin/user/update", supAuth, updateUserDetail)
router.post("/admin/courses/create", adminAuth, createNewCourse)

// router.post("/admin/courses/add", adminAuth, )
// router.update()

router.get("/sessions/fetch", getSessions)

// for student
router.post("/auth/detail/student", getstudentDetailFronNetQue)
router.post("/auth/register", createAccountStudent)
router.get("/auth/verify", verify)
router.post("/auth/signin", signin)
router.get("/courses/fetch", studentAuth, getAllCourses)

router.post("/coordinator/schedule/create", coordAuth, createSeminardate)
router.get("/coordinator/schedule/fetch", coordAuth, getAllSeminars)
router.get("/coordinator/topics/fetch", coordAuth, getAllTopics)
router.get("/coordinator/students/fetch", coordAuth, viewstudentList)
router.get("/coordinator/invites/send", coordAuth, sendOutSeminarInvite)

module.exports = {
    router
}