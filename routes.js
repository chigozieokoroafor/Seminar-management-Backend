const {Router} = require("express");
const { createNewSession } = require("./src/controllers/admincontroller");

const router = Router();

// router.get()
router.post("/admin/session/create", createNewSession)
// router.update()

module.exports = {
    router
}