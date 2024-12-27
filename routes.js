const {Router} = require("express");
const { createNewSession, createnewUser } = require("./src/controllers/admincontroller");
const { createAccountStudent, getstudentDetailFronNetQue, verify, signin } = require("./src/controllers/authController");
const { getAllCourses, getSessions } = require("./src/controllers/baseController");
const { studentAuth } = require("./src/helpers/middleware");

const router = Router();

// for admin
// router.get()
router.post("/admin/session/create", createNewSession)
router.post("/admin/user/create", createnewUser)
// router.update()

router.get("/sessions/fetch", getSessions)

// for student
router.post("/auth/detail/student", getstudentDetailFronNetQue)
router.post("/auth/register", createAccountStudent)
router.get("/auth/verify", verify)
router.post("/auth/signin", signin)

router.get("/courses/fetch", studentAuth, getAllCourses)


module.exports = {
    router
}