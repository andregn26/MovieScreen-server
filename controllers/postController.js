const User = require("../models/User.model");
const Post = require("../models/Post.model.js");
const Comment = require("../models/Comment.model");

exports.getUserFeed = async (req, res) => {
	try {
		const { username } = req.params;

		const loggedUser = await User.findOne({ username: username }).populate("follows");
		const { follows } = loggedUser;

		const allPosts = await Post.find().populate("author");
		const loggedUserPosts = allPosts.filter((post) => post.author.username === loggedUser.username);

		let followsPosts = [];
		follows.forEach((follow) => {
			let foundFollowPosts = allPosts.filter((post) => post.author.username === follow.username);
			followsPosts.push(...foundFollowPosts);
		});

		res.status(200).json([...loggedUserPosts, ...followsPosts]);
	} catch (error) {
		console.error({ message: error.message });
		res.status(500).json({ error });
	}
};

exports.postUserPost = async (req, res) => {
	try {
		const { poster, content, likes, comments } = req.body.post;
		const { author } = req.body.post;

		const newPost = await Post.create({
			author,
			poster,
			content,
			likes,
			comments,
		});

		await User.findByIdAndUpdate(author, { $push: { posts: newPost._id } }, { new: true });

		const createdPost = await Post.findById(newPost._id).populate("author");

		// io.emit("newPost", createdPost);
		res.status(200).json(createdPost);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.deletePost = async (req, res) => {
	try {
		const { postId } = req.params;

		const postToDelete = await Post.findById(postId).populate("author");

		await User.findByIdAndUpdate(postToDelete.author._id, { $pull: { posts: postToDelete._id } }, { new: true });

		const deletedPost = await Post.findByIdAndDelete(postId);

		res.status(200).json(deletedPost);
	} catch (error) {
		console.log("error", error.message);
		res.status(500).json({ error });
	}
};

exports.postComment = async (req, res) => {
	try {
		const { postId } = req.params;
		const { comment } = req.body.comment;
		const { user } = req.body.comment;

		const createdComment = await Comment.create({
			author: user,
			post: postId,
			content: comment,
		});

		const foundPost = await Post.findByIdAndUpdate(
			postId,
			{
				$push: { comments: createdComment._id },
			},
			{ new: true }
		);

		res.status(200).json(foundPost);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.getAllComments = async (req, res) => {
	try {
		const { postId } = req.params;

		const commentsInPost = await Post.findById(postId).populate({
			path: "comments",
			populate: { path: "author" },
		});

		res.status(200).json(commentsInPost);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.putLikePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const { userId } = req.body;

		const postToLike = await Post.findById(postId);

		if (!postToLike.likes.includes(userId)) {
			await Post.findByIdAndUpdate(postId, { $push: { likes: userId } }, { new: true });
		}

		res.status(200).json(postToLike);
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.putDislikePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const { userId } = req.body;

		const postToDislike = await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true });

		res.status(200).json(postToDislike);
	} catch (error) {
		res.status(500).json({ error });
	}
};
