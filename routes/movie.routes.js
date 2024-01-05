const router = require("express").Router();
const movieController = require("../controllers/movieController");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const fileUpload = require("../config/cloudinary");

// TODO Confirm if the POST route is in use in front end
router.route("/movies").get(movieController.getAllMovies).post(movieController.postMovieToFavorite);
router.route("/movies/add").put(isAuthenticated, movieController.putMovieInFavorites);
// TODO Confirm if the DELETE route for DELETE MOVIE FROM FAVORITES is in use in front end
router.route("movies/:movieId").delete(movieController.deleteMovieFromFavorite);
router.route("/reviews/:movieId").get(movieController.getMovieReviews);

//PUT remove movie from favourites
router.route("/movies/:movieId/remove").put(movieController.removeMovieFromFavorites);
router.route("/upload").post(fileUpload.single("file"), movieController.postUpload);

module.exports = router;
