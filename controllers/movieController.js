const User = require("../models/User.model");
const Movie = require("../models/Movie.model");

exports.getAllMovies = async (req, res) => {
	try {
		const allMoviesFromDB = await Movie.find();
		res.status(200).json(allMoviesFromDB);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.postMovieToFavorite = async (req, res) => {
	try {
		const { title, posterURL, overview } = req.body;
		const newMovie = await Movie.create({
			title,
			posterURL,
			overview,
			reviews: [],
		});

		// newMovie._id needs to be put in User Favourites Array
		res.status(200).json(newMovie);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.deleteMovieFromFavorite = async (req, res) => {
	try {
		const { movieId } = req.params;
		const movieDeleted = await Movie.findByIdAndDelete(movieId);
		res.status(200).json(movieDeleted);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.getMovieReviews = async (req, res) => {
	try {
		const { movieId } = req.params;

		const foundMovie = await Movie.findOne({ id: movieId })
			.populate("reviews")
			.populate({ path: "reviews", populate: { path: "author" } });

		res.status(200).json(foundMovie);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.putMovieInFavorites = async (req, res) => {
	try {
		//grab the info from the moviedetails page
		const { title, genres, poster_path, tagline, overview, vote_average, release_date, runtime, id, imdb_id } = req.body;

		//check if movie exists in my DB
		const checkForMovieDB = await Movie.findOne({ id });

		//find user in my DB
		const userFavList = await User.findOne({
			username: req.payload.username,
		});

		//if the movie is in my DB and if the movieID is in the user favourite's array, do nothing - avoid repetitions
		if (checkForMovieDB && userFavList.favourites.includes(checkForMovieDB._id)) {
			return res.status(200).json(checkForMovieDB);
		}

		//if the movie is found in my DB and the movieID is NOT in the user favourite's array, put the ID inside
		if (checkForMovieDB && !userFavList.favourites.includes(checkForMovieDB._id)) {
			const response = await User.findOneAndUpdate(
				{ username: req.payload.username },
				{
					$push: { favourites: checkForMovieDB._id },
				},
				{ new: true }
			);

			res.status(200).json(response);
		}

		//If the movie is not found in my DB, it means that the movie was not added to favourite's by any other user, so create a movie in my DB and pass it to the user favourite's array
		if (!checkForMovieDB) {
			const movieCreated = await Movie.create({
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

			const response = await User.findOneAndUpdate(
				{ username: req.payload.username },
				{
					$push: { favourites: movieCreated._id },
				},
				{ new: true }
			);

			res.status(200).json(response);
		}
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.removeMovieFromFavorites = async (req, res) => {
	try {
		const { movieId } = req.params;
		const { username } = req.body;

		//find movie from my DB
		const movieFromDB = await Movie.findOne({ id: movieId });

		//find user in my DB & update favourite list
		const userToUpdate = await User.findOneAndUpdate(
			{ username: username },
			{
				$pull: { favourites: movieFromDB._id },
			},
			{ new: true }
		);

		res.status(200).json(userToUpdate);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.postUpload = (req, res) => {
	try {
		res.status(200).json({ fileUrl: req.file.path });
	} catch (e) {
		res.status(500).json({
			message: `An error occured while uploading the image - ${e.message}`,
		});
	}
};
