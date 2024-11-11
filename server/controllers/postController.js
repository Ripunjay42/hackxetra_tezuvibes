// controllers/postController.js
const prisma = require("../db/index");

exports.createPost = async (req, res) => {
    const { title, description, content, userId } = req.body;
    
    try {
      // Validate required fields
      if (!title || !description || !content || !userId) {
        // Remove uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: {
            title: !title ? 'Title is required' : null,
            description: !description ? 'Description is required' : null,
            content: !content ? 'Content is required' : null,
            userId: !userId ? 'User ID is required' : null
          }
        });
      }
  
      // Verify user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });
  
      if (!userExists) {
        // Remove uploaded file if user doesn't exist
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Get image URL if file was uploaded
      const imageUrl = req.file 
        ? `/uploads/${req.file.filename}`  // URL path to access the image
        : null;
  
      // Create post
      const post = await prisma.post.create({
        data: {
          title,
          description,
          content,
          userId,
          imageUrl, // Add the image URL to the database
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              profilePicURL: true,
            },
          },
          Like: true,
          Comment: true,
        },
      });
  
      return res.status(201).json(post);
    } catch (error) {
      // Remove uploaded file if post creation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Post creation error:', error);
      return res.status(500).json({ 
        error: 'Failed to create post',
        details: error.message 
      });
    }
};


// Get all posts with user details, likes, and comments
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profilePicURL: true,
          },
        },
        Like: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        Comment: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                profilePicURL: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Toggle like on a post
exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      // Unlike if already liked
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      // Create new like
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      res.status(201).json({ message: 'Post liked successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Add comment to a post
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, comment } = req.body;

  try {
    const newComment = await prisma.comment.create({
      data: {
        postId,
        userId,
        comment,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profilePicURL: true,
          },
        },
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get posts by user ID
exports.getUserPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profilePicURL: true,
          },
        },
        Like: true,
        Comment: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                profilePicURL: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        if (!postId || !userId) {
            return res.status(400).json({ 
                error: 'Post ID and User ID are required' 
            });
        }

        const numericPostId = parseInt(postId);
        const numericUserId = parseInt(userId);

        const post = await prisma.post.findUnique({
            where: { id: numericPostId },
            include: { user: true }
        });

        if (!post) {
            return res.status(404).json({ 
                error: 'Post not found' 
            });
        }

        if (post.userId !== numericUserId) {
            return res.status(403).json({ 
                error: 'Not authorized to delete this post' 
            });
        }

        // Delete associated image if it exists
        if (post.imageUrl) {
            const imagePath = `./public${post.imageUrl}`;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.post.delete({
            where: { id: numericPostId }
        });

        return res.status(200).json({ 
            message: 'Post deleted successfully' 
        });

    } catch (error) {
        console.error('Delete post error:', error);
        return res.status(500).json({ 
            error: 'Failed to delete post'
        });
    }
};