const router = require("express").Router();
const authController = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.route("/signup").post(authController.postSignup);
router.route("/login").post(authController.postLogin);
router.route("/verify").get(isAuthenticated, authController.getVerify);

module.exports = router;
