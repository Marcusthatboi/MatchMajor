// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.get('/:chatroomId', getMessages);
router.post('/', sendMessage);
router.delete('/:messageId', deleteMessage);

module.exports = router;
