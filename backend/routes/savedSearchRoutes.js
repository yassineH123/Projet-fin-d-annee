const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/savedSearchController');

const router = express.Router();
router.use(authenticateToken);

router.get('/',     ctrl.list);
router.post('/',    ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
