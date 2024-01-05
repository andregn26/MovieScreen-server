const authController = require("../controllers/authController");

const express = require("express");
const { isAuthenticated } = require("../middleware/jwt.middleware");

const router = express.Router();

router.route("/signup").post(authController.postSignup);
router.route("/login").post(authController.postLogin);
router.route("/verify").get(isAuthenticated, authController.getVerify);

module.exports = router;
