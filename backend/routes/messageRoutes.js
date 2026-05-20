const express = require('express');
const { body } = require('express-validator');
const c = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/unread-count',                  c.unreadCount);
router.get('/conversations',                 c.getConversations);
router.get('/conversations/:conversationId', c.getMessages);
router.post('/group',                        c.createGroup);
router.post('/',
  [body('content').trim().notEmpty().withMessage('Message vide.')],
  c.sendMessage
);
router.post('/:id/react', c.reactToMessage);

module.exports = router;
