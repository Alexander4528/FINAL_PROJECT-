const prisma = require('../config/database');
const { 
  validate, 
  commentValidation 
} = require('../middleware/validation');

const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comment.count({ where: { postId } })
    ]);
    
    res.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
};

const createComment = [
  validate(commentValidation),
  async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });
      
      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }
      
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: req.user.id,
          postId
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add comment'
      });
    }
  }
];

const updateComment = [
  validate(commentValidation),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      // Check if comment exists
      const comment = await prisma.comment.findUnique({
        where: { id }
      });
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }
      
      // Check if user is author or admin
      if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this comment'
        });
      }
      
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        message: 'Comment updated successfully',
        comment: updatedComment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update comment'
      });
    }
  }
];

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id }
    });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Check if user is author or admin
    if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }
    
    await prisma.comment.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    });
  }
};

module.exports = {
  getPostComments,
  createComment,
  updateComment,
  deleteComment
};