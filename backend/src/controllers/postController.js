const prisma = require('../config/database');
const { redisClient } = require('../config/redis');
const { 
  validate, 
  postValidation 
} = require('../middleware/validation');

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const tag = req.query.tag;
    const authorId = req.query.author;
    const sortBy = req.query.sort || 'newest';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tag) {
      where.tags = {
        some: {
          name: tag
        }
      };
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    // Build orderBy
    const orderBy = {};
    switch (sortBy) {
      case 'popular':
        orderBy.likes = { _count: 'desc' };
        break;
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      default: // newest
        orderBy.createdAt = 'desc';
    }
    
    // Try cache first
    const cacheKey = `posts:${page}:${limit}:${search}:${tag}:${authorId}:${sortBy}`;
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // Query database
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          tags: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              favorites: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);
    
    // Check user interactions
    if (req.user) {
      for (const post of posts) {
        const [userLike, userFavorite] = await Promise.all([
          prisma.like.findUnique({
            where: {
              userId_postId: {
                userId: req.user.id,
                postId: post.id
              }
            }
          }),
          prisma.favorite.findUnique({
            where: {
              userId_postId: {
                userId: req.user.id,
                postId: post.id
              }
            }
          })
        ]);
        
        post.userLike = !!userLike;
        post.userFavorite = !!userFavorite;
      }
    }
    
    const result = {
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    };
    
    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
    
    res.json(result);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true
          }
        },
        tags: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true
          }
        }
      }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    // Check user interactions
    if (req.user) {
      const [userLike, userFavorite] = await Promise.all([
        prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: req.user.id,
              postId: id
            }
          }
        }),
        prisma.favorite.findUnique({
          where: {
            userId_postId: {
              userId: req.user.id,
              postId: id
            }
          }
        })
      ]);
      
      post.userLike = !!userLike;
      post.userFavorite = !!userFavorite;
    }
    
    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
};

const createPost = [
  validate(postValidation),
  async (req, res) => {
    try {
      const { title, content, excerpt, tags = [] } = req.body;
      
      const post = await prisma.post.create({
        data: {
          title,
          content,
          excerpt: excerpt || content.substring(0, 200) + '...',
          authorId: req.user.id,
          tags: {
            connectOrCreate: tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          }
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          tags: true
        }
      });
      
      // Invalidate cache
      await redisClient.del('posts:*');
      
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create post'
      });
    }
  }
];

const updatePost = [
  validate(postValidation),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, excerpt, tags = [] } = req.body;
      
      // Check if post exists and user is author
      const existingPost = await prisma.post.findUnique({
        where: { id }
      });
      
      if (!existingPost) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }
      
      if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this post'
        });
      }
      
      const post = await prisma.post.update({
        where: { id },
        data: {
          title,
          content,
          excerpt: excerpt || content.substring(0, 200) + '...',
          tags: {
            set: [], // Clear existing tags
            connectOrCreate: tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          }
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          tags: true
        }
      });
      
      // Invalidate cache
      await redisClient.del('posts:*');
      await redisClient.del(`post:${id}`);
      
      res.json({
        success: true,
        message: 'Post updated successfully',
        post
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update post'
      });
    }
  }
];

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists and user is author or admin
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }
    
    await prisma.post.delete({
      where: { id }
    });
    
    // Invalidate cache
    await redisClient.del('posts:*');
    await redisClient.del(`post:${id}`);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId: id
        }
      }
    });
    
    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: req.user.id,
            postId: id
          }
        }
      });
      
      // Invalidate cache
      await redisClient.del('posts:*');
      await redisClient.del(`post:${id}`);
      
      return res.json({
        success: true,
        liked: false,
        message: 'Post unliked'
      });
    }
    
    // Like
    await prisma.like.create({
      data: {
        userId: req.user.id,
        postId: id
      }
    });
    
    // Invalidate cache
    await redisClient.del('posts:*');
    await redisClient.del(`post:${id}`);
    
    res.json({
      success: true,
      liked: true,
      message: 'Post liked'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like post'
    });
  }
};

const favoritePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId: id
        }
      }
    });
    
    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          userId_postId: {
            userId: req.user.id,
            postId: id
          }
        }
      });
      
      // Invalidate cache
      await redisClient.del('posts:*');
      await redisClient.del(`post:${id}`);
      
      return res.json({
        success: true,
        favorited: false,
        message: 'Post removed from favorites'
      });
    }
    
    // Add to favorites
    await prisma.favorite.create({
      data: {
        userId: req.user.id,
        postId: id
      }
    });
    
    // Invalidate cache
    await redisClient.del('posts:*');
    await redisClient.del(`post:${id}`);
    
    res.json({
      success: true,
      favorited: true,
      message: 'Post added to favorites'
    });
  } catch (error) {
    console.error('Favorite post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to favorite post'
    });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  favoritePost
};