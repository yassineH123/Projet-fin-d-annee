const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/friendController');

const router = express.Router();
router.use(authenticateToken);

router.post('/request',           ctrl.sendRequest);
router.put('/:id/accept',         ctrl.accept);
router.put('/:id/refuse',         ctrl.refuse);
router.delete('/:friendId/remove',ctrl.removeFriend);
router.get('/',                   ctrl.getFriends);
router.get('/requests',           ctrl.getRequests);
router.get('/pending-count',      ctrl.pendingCount);
router.get('/mutual/:userId',     ctrl.getMutual);
router.get('/status/:userId',     ctrl.getStatus);

module.exports = router;