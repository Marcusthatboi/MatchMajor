// server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  likePost,
  addComment,
  deletePost
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.get('/:chatroomId', getPosts);
router.post('/', createPost);
router.put('/:postId/like', likePost);
router.post('/:postId/comment', addComment);
router.delete('/:postId', deletePost);

module.exports = router;
