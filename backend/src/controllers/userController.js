const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { redisClient } = require('../config/redis');

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Try cache first
    const cacheKey = `users:${page}:${limit}:${search}`;
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    
    const result = {
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
    // Cache for 2 minutes
    await redisClient.setEx(cacheKey, 120, JSON.stringify(result));
    
    res.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if current user follows this user
    if (req.user) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: id
          }
        }
      });
      
      user.isFollowing = !!follow;
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and is the same user or admin
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }
    
    const { username, email, bio, avatar, password } = req.body;
    
    const updateData = {};
    
    if (username) {
      // Check if username is taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
      
      updateData.username = username;
    }
    
    if (email) {
      // Check if email is taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
      
      updateData.email = email;
    }
    
    if (bio !== undefined) {
      updateData.bio = bio;
    }
    
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Invalidate cache
    await redisClient.del('users:*');
    await redisClient.del(`user:${id}`);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and is the same user or admin
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this user'
      });
    }
    
    await prisma.user.delete({
      where: { id }
    });
    
    // Invalidate cache
    await redisClient.del('users:*');
    await redisClient.del(`user:${id}`);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Can't follow yourself
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself'
      });
    }
    
    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: id
        }
      }
    });
    
    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: id
          }
        }
      });
      
      return res.json({
        success: true,
        following: false,
        message: 'User unfollowed'
      });
    }
    
    // Follow
    await prisma.follow.create({
      data: {
        followerId: req.user.id,
        followingId: id
      }
    });
    
    res.json({
      success: true,
      following: true,
      message: 'User followed'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow user'
    });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: id },
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where: { authorId: id } })
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
    
    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user posts'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  followUser,
  getUserPosts
};