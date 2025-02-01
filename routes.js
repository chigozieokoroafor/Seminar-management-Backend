const { Router } = require("express");
const adminController = require("./src/controllers/admincontroller");
const authController = require("./src/controllers/authController");
const baseController = require("./src/controllers/baseController");
const { studentAuth, adminAuth, supAuth, coordAuth } = require("./src/helpers/middleware");
const coordinatorController = require("./src/controllers/coordinatorController");
const studentController = require("./src/controllers/studentController");

const router = Router();

// for admin
// router.get()
router.post("/admin/session/create", supAuth, adminController.createNewSession)
router.post("/admin/user/create", adminAuth, adminController.createNewUser)
router.get("/admin/users/fetch", supAuth, adminController.fetchAllUsers)
router.put("/admin/user/update", supAuth, adminController.updateUserDetail)
router.post("/admin/courses/create", adminAuth, adminController.createNewCourse)

// router.post("/admin/courses/add", adminAuth, )
// router.update()

router.get("/sessions/fetch", baseController.getSessions)

// for student
router.post("/auth/detail/student", authController.getstudentDetailFronNetQue)
router.post("/auth/register", authController.createAccountStudent)
router.get("/auth/verify", authController.verify)
router.post("/auth/signin", authController.signin)
router.post("/auth/pwd/reset/request", authController.requestPasswordReset)
router.post("/auth/pwd/reset", authController.updatePassword)


router.get("/student/home", studentAuth, studentController.getUserDataForHomePage)
router.post("/seminar/register", studentAuth, studentController.initiateSeminarRegistration)
// router.get("/student/home/pending", studentAuth, studentController)



router.get("/courses/fetch", studentAuth, baseController.getAllCourses)

router.post("/coordinator/schedule/create", coordAuth, coordinatorController.createSeminardate)
router.get("/coordinator/schedule/fetch", coordAuth, coordinatorController.getAllSeminars)
router.get("/coordinator/topics/fetch", coordAuth, coordinatorController.getAllTopics)
router.get("/coordinator/students/fetch", coordAuth, coordinatorController.viewstudentList)
router.get("/coordinator/invites/send", coordAuth, coordinatorController.sendOutSeminarInvite)

module.exports = {
    router
}