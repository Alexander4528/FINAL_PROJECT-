const express = require('express');
const { 
  getPosts, 
  getPost, 
  createPost, 
  updatePost, 
  deletePost, 
  likePost,
  favoritePost 
} = require('../controllers/postController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (with search, filters and pagination)
// @access  Public
router.get('/', getPosts);

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', getPost);

// Protected routes (require authentication)
router.use(auth);

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', createPost);

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (owner or admin)
router.put('/:id', updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (owner or admin)
router.delete('/:id', deletePost);

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/:id/like', likePost);

// @route   POST /api/posts/:id/favorite
// @desc    Add/Remove post from favorites
// @access  Private
router.post('/:id/favorite', favoritePost);

module.exports = router;