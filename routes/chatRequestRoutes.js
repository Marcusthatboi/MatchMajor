const express = require('express');
const router = express.Router();
const {
  getChatRequests,
  createChatRequest,
  acceptChatRequest,
  declineChatRequest
} = require('../controllers/chatRequestController');
const { protect } = require('../server/middleware/authMiddleware_enhanced');

router.use(protect);

router.get('/', getChatRequests);
router.post('/', createChatRequest);
router.put('/:requestId/accept', acceptChatRequest);
router.put('/:requestId/decline', declineChatRequest);

module.exports = router;
