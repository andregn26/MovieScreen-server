const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.postSignup = async (req, res) => {
	try {
		const { username, email, password, country, genres, profileImg } = req.body;

		//Info for confirmation
		if (!email || !password || !username) {
			res.status(400).json({ message: "missing fields" });
			return;
		}

		//Checks if username already exists in DB
		const foundUser = await User.findOne({ username: username });
		if (foundUser) {
			res.status(400).json({ message: "user already exists" });
			return;
		}

		//Add salt to password
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(password, salt);

		//Create user if all conditions are passed
		const createdUser = await User.create({
			email,
			username,
			country,
			genres,
			password: hashedPassword,
			profileImg,
		});

		res.status(200).json({
			email: createdUser.email,
			username: createdUser.username,
			_id: createdUser._id,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.postLogin = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({ message: "missing fields" });
			return;
		}

		const foundUser = await User.findOne({ email: email });

		if (!foundUser) {
			res.status(401).json({ message: "invalid login" });
			return;
		}

		const correctPassword = bcrypt.compareSync(password, foundUser.password);

		if (!correctPassword) {
			res.status(401).json({ message: "invalid login" });
			return;
		}

		const authToken = jwt.sign(
			{
				_id: foundUser._id,
				email: foundUser.email,
				username: foundUser.username,
				profileImg: foundUser.profileImg,
			},
			process.env.TOKEN_SECRET,
			{ algorithm: "HS256", expiresIn: "6h" }
		);

		res.status(200).json({ authToken });
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.getVerify = (req, res) => {
	res.status(200).json(req.payload);
};
