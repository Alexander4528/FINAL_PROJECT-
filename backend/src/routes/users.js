const express = require('express');
const { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser, 
  followUser,
  getUserPosts 
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with search and pagination)
// @access  Public
router.get('/', getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUser);

// @route   GET /api/users/:id/posts
// @desc    Get user's posts
// @access  Public
router.get('/:id/posts', getUserPosts);

// Protected routes (require authentication)
router.use(auth);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (owner or admin)
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (owner or admin)
router.delete('/:id', deleteUser);

// @route   POST /api/users/:id/follow
// @desc    Follow/Unfollow user
// @access  Private
router.post('/:id/follow', followUser);

module.exports = router;