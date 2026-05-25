const express  = require('express');
const { Op }   = require('sequelize');
const Post        = require('../models/Post');
const PostLike    = require('../models/PostLike');
const PostComment = require('../models/PostComment');
const User        = require('../models/User');
const upload      = require('../middleware/uploadMiddleware');

/* ── Auth middleware ── */
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'atlasway_secret';
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalide' }); }
}

const router = express.Router();

/* ── GET /posts?page=1 ── */
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.page) || 1);
    const limit = 20;
    const token = req.headers.authorization?.split(' ')[1];
    let currentUserId = null;
    if (token) { try { currentUserId = jwt.verify(token, SECRET).id; } catch {} }

    const posts = await Post.findAll({
      order:   [['createdAt', 'DESC']],
      limit,
      offset:  (page - 1) * limit,
      include: [
        { model: User, attributes: ['id','firstName','lastName','avatar'] },
        { model: PostComment, include: [{ model: User, attributes: ['id','firstName','lastName','avatar'] }], order: [['createdAt','ASC']] },
      ],
    });

    /* Ajouter liked par l'utilisateur courant */
    const enriched = await Promise.all(posts.map(async (p) => {
      const plain = p.toJSON();
      if (currentUserId) {
        const liked = await PostLike.findOne({ where: { postId: p.id, userId: currentUserId } });
        plain.likedByMe = !!liked;
      } else {
        plain.likedByMe = false;
      }
      return plain;
    }));

    res.json(enriched);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /posts ── créer un post (avec media optionnel) ── */
router.post('/', auth, upload.media.single('media'), async (req, res) => {
  try {
    const { type, content, fromCity, toCity, tripDate, price, seats } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Contenu requis' });

    let mediaUrl  = null;
    let mediaType = null;
    if (req.file) {
      mediaUrl  = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const post = await Post.create({
      userId: req.user.id, type: type || 'text',
      content: content.trim(), fromCity, toCity, tripDate,
      price: price ? parseInt(price) : null,
      seats: seats ? parseInt(seats) : null,
      mediaUrl, mediaType,
    });
    const full = await Post.findByPk(post.id, {
      include: [{ model: User, attributes: ['id','firstName','lastName','avatar'] }]
    });
    res.status(201).json({ ...full.toJSON(), likedByMe: false });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── DELETE /posts/:id ── */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post introuvable' });
    if (post.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin')
      return res.status(403).json({ error: 'Non autorisé' });
    await PostLike.destroy({ where: { postId: post.id } });
    await PostComment.destroy({ where: { postId: post.id } });
    await post.destroy();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /posts/:id/like ── toggle like ── */
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post introuvable' });
    const existing = await PostLike.findOne({ where: { postId: post.id, userId: req.user.id } });
    if (existing) {
      await existing.destroy();
      await post.decrement('likesCount');
      return res.json({ liked: false, likesCount: post.likesCount - 1 });
    } else {
      await PostLike.create({ postId: post.id, userId: req.user.id });
      await post.increment('likesCount');
      return res.json({ liked: true, likesCount: post.likesCount + 1 });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /posts/:id/comments ── ajouter un commentaire ── */
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Commentaire vide' });
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post introuvable' });
    const comment = await PostComment.create({ postId: post.id, userId: req.user.id, content: content.trim() });
    const full = await PostComment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id','firstName','lastName','avatar'] }]
    });
    res.status(201).json(full);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── DELETE /posts/:id/comments/:cid ── */
router.delete('/:id/comments/:cid', auth, async (req, res) => {
  try {
    const comment = await PostComment.findByPk(req.params.cid);
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' });
    if (comment.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin')
      return res.status(403).json({ error: 'Non autorisé' });
    await comment.destroy();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
