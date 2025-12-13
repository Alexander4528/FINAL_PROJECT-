const express = require('express');
const { 
  getPostComments, 
  createComment, 
  updateComment, 
  deleteComment 
} = require('../controllers/commentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts/:postId/comments
// @desc    Get comments for a post
// @access  Public
router.get('/posts/:postId/comments', getPostComments);

// Protected routes (require authentication)
router.use(auth);

// @route   POST /api/posts/:postId/comments
// @desc    Add comment to a post
// @access  Private
router.post('/posts/:postId/comments', createComment);

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private (owner or admin)
router.put('/:id', updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private (owner or admin)
router.delete('/:id', deleteComment);

module.exports = router;