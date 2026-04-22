// server/routes/chatroomRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllChatrooms,
  createChatroom,
  joinChatroom,
  leaveChatroom,
  getChatroom,
  deleteChatroom
} = require('../controllers/chatroomController');
const { protect } = require('../server/middleware/authMiddleware_enhanced');

router.use(protect); // All routes require authentication

// Specific routes before parameterized routes
router.get('/', getAllChatrooms);
router.post('/', createChatroom);
router.post('/join', joinChatroom);
router.post('/leave', leaveChatroom);
router.delete('/:id', deleteChatroom);
router.get('/:id', getChatroom);

module.exports = router;
