// server/routes/chatroomRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllChatrooms,
  createChatroom,
  joinChatroom,
  leaveChatroom,
  getChatroom
} = require('../controllers/chatroomController');
const { protect } = require('../server/middleware/authMiddleware_enhanced');

router.use(protect); // All routes require authentication

router.get('/', getAllChatrooms);
router.post('/', createChatroom);
router.get('/:id', getChatroom);
router.post('/join', joinChatroom);
router.post('/leave', leaveChatroom);

module.exports = router;
