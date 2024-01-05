const router = require("express").Router();
const reviewController = require("../controllers/reviewController");

router.route("/movies/:movieId/review").post(reviewController.postMovieReview);
router.route("/profile/:username/reviews").get(reviewController.getUserReviews);
router.route("/:reviewId/edit").put(reviewController.putEditReview);
router.route("/:reviewId/delete").delete(reviewController.deleteReview);
router.route("/random-reviews").get(reviewController.getRandomReviews);

module.exports = router;
