const router = require("express").Router();
const postController = require("../controllers/postController.js");

router.route("/feed/:username").get(postController.getUserFeed);
router.route("/create-post").post(postController.postUserPost);
router.route("/delete/:postId").delete(postController.deletePost);
router.route("/comment/:postId").post(postController.postComment);
router.route("/comment/:postId").get(postController.getAllComments);
router.route("/like/:postId").put(postController.putLikePost);
router.route("/dislike/:postId").put(postController.putDislikePost);

module.exports = router;
