const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Review = require("../models/Review.model");

exports.postMovieReview = async (req, res) => {
	try {
		const { movieId } = req.params;
		const userId = req.body.author;
		const { review, rating } = req.body;

		//grab the info from the moviedetails page
		const { title, genres, poster_path, tagline, overview, vote_average, release_date, runtime, id, imdb_id } = req.body;

		let createdReview;

		//Check if movie exists in DB
		const ratedMovie = await Movie.findOne({ id: movieId });

		//If movie exists in my DB, create a review and pass the id to the reviews array
		if (ratedMovie) {
			createdReview = await Review.create({
				author: userId,
				movie: ratedMovie._id,
				review,
				rating,
			});

			await Movie.findOneAndUpdate(
				{ id: movieId },
				{
					$push: { reviews: createdReview._id },
				},
				{ new: true }
			);
		}

		//If the movie does not exist in my DB, create one, create the review and finally pass the id to the reviews array
		if (!ratedMovie) {
			const newMovie = await Movie.create({
				title,
				genres,
				poster_path,
				tagline,
				overview,
				vote_average,
				release_date,
				runtime,
				id,
				imdb_id,
				reviews: [],
			});

			createdReview = await Review.create({
				author: userId,
				movie: newMovie._id,
				review,
				rating,
			});

			await Movie.findOneAndUpdate(
				{ id: movieId },
				{
					$push: { reviews: createdReview._id },
				},
				{ new: true }
			);
		}

		//Look for the user and pass the review id to the reviews array
		const foundUser = await User.findByIdAndUpdate(
			userId,
			{
				$push: { reviews: createdReview._id },
			},
			{ new: true }
		);

		res.status(200).json(foundUser);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.getUserReviews = async (req, res) => {
	try {
		const { username } = req.params;

		const foundUser = await User.findOne({ username: username }).populate({
			path: "reviews",
			populate: { path: "movie" },
		});

		res.status(200).json(foundUser);
	} catch (error) {
		console.log("error", error.message);
		res.status(500).json({ error });
	}
};

exports.putEditReview = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const { review, rating } = req.body.editingMovie;

		const reviewToUpdate = await Review.findByIdAndUpdate(reviewId, { review, rating }, { new: true });
		res.status(200).json(reviewToUpdate);
	} catch (error) {
		console.log("error", error.message);
		res.status(500).json({ error });
	}
};

exports.deleteReview = async (req, res) => {
	try {
		const { reviewId } = req.params;

		const findReview = await Review.findById(reviewId).populate("author").populate("movie");

		await User.findOneAndUpdate({ username: findReview.author.username }, { $pull: { reviews: reviewId } }, { new: true });

		await Movie.findOneAndUpdate({ id: findReview.movie.id }, { $pull: { reviews: reviewId } }, { new: true });

		const deletedReview = await Review.findByIdAndDelete(reviewId);

		res.status(200).json(deletedReview);
	} catch (error) {
		console.log("error", error.message);
		res.status(500).json({ error });
	}
};

exports.getRandomReviews = async (req, res) => {
	try {
		const reviews = await Review.find().populate("author").populate("movie");

		let randomPos;
		let temp;

		for (let i = reviews.length - 1; i > 0; i--) {
			randomPos = Math.floor(Math.random() * (i + 1));
			temp = reviews[i];
			reviews[i] = reviews[randomPos];
			reviews[randomPos] = temp;
		}

		let randomReviews = reviews.slice(0, 3);

		res.status(200).json(randomReviews);
	} catch (error) {
		res.status(500).json({ error });
	}
};
