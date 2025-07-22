const Post = require('../models/Post');
const User = require('../models/User'); // needed for save feature

exports.createPost = async (req, res) => {
  try {
    const { username, profile, image, caption } = req.body;

    const newPost = new Post({ username, profile, image, caption, likes: [], comments: [] });
    await newPost.save();

    res.status(201).json({ message: 'Post created', post: newPost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { username } = req.body;

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(username)) {
      post.likes = post.likes.filter(u => u !== username);
    } else {
      post.likes.push(username);
    }

    await post.save();
    res.json({ message: 'Like updated', likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { username, text } = req.body;

    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.unshift({ username, text });
    await post.save();

    res.json({ message: 'Comment added', comments: post.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    const postId = req.params.id;

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.savedPosts.includes(postId)) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();
    res.json({ message: 'Saved posts updated', savedPosts: user.savedPosts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
