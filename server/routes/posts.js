import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import Post from '../models/Post.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateImageFile, sanitizeText } from '../utils/validation.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/community';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Maximum 3 images per post
  },
  fileFilter: (req, file, cb) => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.error), false);
    }
  }
});

// Create a new post
router.post('/', authenticateToken, upload.array('images', 3), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const authorId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Sanitize content
    const sanitizedContent = sanitizeText(content);
    const sanitizedTitle = sanitizeText(title);

    // Process uploaded images
    const processedImages = [];
    if (req.files) {
      for (const file of req.files) {
        const compressedPath = file.path.replace(/\.[^/.]+$/, '_compressed.jpg');
        
        await sharp(file.path)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(compressedPath);

        processedImages.push({
          filename: path.basename(compressedPath),
          originalName: file.originalname,
          mimetype: 'image/jpeg',
          size: fs.statSync(compressedPath).size,
          url: `/uploads/community/${path.basename(compressedPath)}`
        });

        // Remove original file
        fs.unlinkSync(file.path);
      }
    }

    // Create post
    const post = new Post({
      author: authorId,
      title: sanitizedTitle,
      content: sanitizedContent,
      images: processedImages,
      category: category || 'general',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    });

    await post.save();
    await post.populate('author', 'name village district');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post. Please try again.'
    });
  }
});

// Get all posts with pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const userId = req.user?.userId;

    // Build query
    let query = { isDeleted: false };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name village district')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    // Add user interaction data if authenticated
    if (userId) {
      posts.forEach(post => {
        post.userLiked = post.likes.some(like => like.user.toString() === userId);
        post.userDisliked = post.dislikes.some(dislike => dislike.user.toString() === userId);
      });
    }

    res.json({
      success: true,
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts'
    });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await Post.findOne({ _id: id, isDeleted: false })
      .populate('author', 'name village district')
      .populate('replies.author', 'name village district');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    // Add user interaction data if authenticated
    if (userId) {
      post.userLiked = post.likes.some(like => like.user.toString() === userId);
      post.userDisliked = post.dislikes.some(dislike => dislike.user.toString() === userId);
      
      post.replies.forEach(reply => {
        reply.userLiked = reply.likes.some(like => like.user.toString() === userId);
        reply.userDisliked = reply.dislikes.some(dislike => dislike.user.toString() === userId);
      });
    }

    res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post'
    });
  }
});

// Like/Unlike a post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked
    const existingLike = post.likes.find(like => like.user.toString() === userId);
    const existingDislike = post.dislikes.find(dislike => dislike.user.toString() === userId);

    if (existingLike) {
      // Remove like
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      // Add like and remove dislike if exists
      post.likes.push({ user: userId });
      if (existingDislike) {
        post.dislikes = post.dislikes.filter(dislike => dislike.user.toString() !== userId);
      }
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      dislikes: post.dislikes.length
    });

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post'
    });
  }
});

// Dislike/Undislike a post
router.post('/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already disliked
    const existingDislike = post.dislikes.find(dislike => dislike.user.toString() === userId);
    const existingLike = post.likes.find(like => like.user.toString() === userId);

    if (existingDislike) {
      // Remove dislike
      post.dislikes = post.dislikes.filter(dislike => dislike.user.toString() !== userId);
    } else {
      // Add dislike and remove like if exists
      post.dislikes.push({ user: userId });
      if (existingLike) {
        post.likes = post.likes.filter(like => like.user.toString() !== userId);
      }
    }

    await post.save();

    res.json({
      success: true,
      message: existingDislike ? 'Post undisliked' : 'Post disliked',
      likes: post.likes.length,
      dislikes: post.dislikes.length
    });

  } catch (error) {
    console.error('Dislike post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dislike post'
    });
  }
});

// Reply to a post
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Sanitize content
    const sanitizedContent = sanitizeText(content);

    // Add reply
    post.replies.push({
      author: userId,
      content: sanitizedContent
    });

    await post.save();
    await post.populate('replies.author', 'name village district');

    const newReply = post.replies[post.replies.length - 1];

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      reply: newReply
    });

  } catch (error) {
    console.error('Reply to post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
});

// Delete a post (only by author)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findOne({ _id: id, author: userId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you are not authorized to delete it'
      });
    }

    post.isDeleted = true;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

export default router;
