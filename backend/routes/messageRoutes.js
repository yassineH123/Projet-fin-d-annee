const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/unread-count', messageController.unreadCount);
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:conversationId', messageController.getMessages);
router.post('/',
  [
    body('receiverId').notEmpty().withMessage('Destinataire requis.'),
    body('content').trim().notEmpty().withMessage('Message vide.'),
  ],
  messageController.sendMessage
);

module.exports = router;
