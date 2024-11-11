const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../config/multer');

// Get all posts
router.get('/', postController.getAllPosts);

// Create new post
router.post('/', upload.single('image'), postController.createPost);

// Toggle like on a post
router.post('/:postId/like', postController.toggleLike);

// Add comment to a post
router.post('/:postId/comment', postController.addComment);

// Get posts by user ID
router.get('/user/:userId', postController.getUserPosts);
// Delete a post
router.delete('/:postId', postController.deletePost);

module.exports = router;