const express  = require('express');
const { Op }   = require('sequelize');
const Post         = require('../models/Post');
const PostLike     = require('../models/PostLike');
const PostComment  = require('../models/PostComment');
const PostReaction = require('../models/PostReaction');
const PostSave     = require('../models/PostSave');
const User         = require('../models/User');
const upload       = require('../middleware/uploadMiddleware');
const { getIO }    = require('../socket');

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

/* ── GET /posts?page=1&type=trip&city=Casablanca&tag=hashtag ── */
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const token = req.headers.authorization?.split(' ')[1];
    let currentUserId = null;
    if (token) { try { currentUserId = jwt.verify(token, SECRET).id; } catch {} }

    const where = {};
    if (req.query.type && req.query.type !== 'all') where.type = req.query.type;
    if (req.query.city) where[Op.or] = [{ fromCity: req.query.city }, { toCity: req.query.city }];
    if (req.query.tag)  where.content = { [Op.like]: `%#${req.query.tag}%` };
    if (req.query.saved === '1' && currentUserId) {
      const saves = await PostSave.findAll({ where: { userId: currentUserId }, attributes: ['postId'] });
      where.id = { [Op.in]: saves.map(s => s.postId) };
    }

    const posts = await Post.findAll({
      where,
      order:   [['pinned', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset:  (page - 1) * limit,
      include: [
        { model: User, attributes: ['id','firstName','lastName','avatar','photo'] },
        { model: PostComment, include: [{ model: User, attributes: ['id','firstName','lastName','avatar','photo'] }], order: [['createdAt','ASC']] },
      ],
    });

    const enriched = await Promise.all(posts.map(async (p) => {
      const plain = p.toJSON();
      if (currentUserId) {
        const [liked, saved, reactions] = await Promise.all([
          PostLike.findOne({ where: { postId: p.id, userId: currentUserId } }),
          PostSave.findOne({ where: { postId: p.id, userId: currentUserId } }),
          PostReaction.findAll({ where: { postId: p.id } }),
        ]);
        plain.likedByMe = !!liked;
        plain.savedByMe = !!saved;
        plain.reactions = reactions.map(r => ({ emoji: r.emoji, userId: r.userId }));
        plain.myReaction = reactions.find(r => r.userId === currentUserId)?.emoji || null;
      } else {
        plain.likedByMe = false;
        plain.savedByMe = false;
        plain.reactions = [];
        plain.myReaction = null;
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

/* ── POST /posts/:id/react ── toggle emoji reaction ── */
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji = '❤️' } = req.body;
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post introuvable' });

    const existing = await PostReaction.findOne({ where: { postId: post.id, userId: req.user.id } });
    if (existing) {
      if (existing.emoji === emoji) {
        await existing.destroy();
        const reactions = await PostReaction.findAll({ where: { postId: post.id } });
        getIO()?.to('feed').emit('post_reaction', { postId: post.id, reactions: reactions.map(r => ({ emoji: r.emoji, userId: r.userId })), myReaction: null, userId: req.user.id });
        return res.json({ myReaction: null, reactions: reactions.map(r => ({ emoji: r.emoji, userId: r.userId })) });
      } else {
        await existing.update({ emoji });
      }
    } else {
      await PostReaction.create({ postId: post.id, userId: req.user.id, emoji });
    }
    const reactions = await PostReaction.findAll({ where: { postId: post.id } });
    getIO()?.to('feed').emit('post_reaction', { postId: post.id, reactions: reactions.map(r => ({ emoji: r.emoji, userId: r.userId })), myReaction: emoji, userId: req.user.id });
    return res.json({ myReaction: emoji, reactions: reactions.map(r => ({ emoji: r.emoji, userId: r.userId })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /posts/:id/save ── toggle save ── */
router.post('/:id/save', auth, async (req, res) => {
  try {
    const existing = await PostSave.findOne({ where: { postId: req.params.id, userId: req.user.id } });
    if (existing) { await existing.destroy(); return res.json({ saved: false }); }
    await PostSave.create({ postId: req.params.id, userId: req.user.id });
    return res.json({ saved: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PATCH /posts/:id/pin ── toggle pin (admin/owner) ── */
router.patch('/:id/pin', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post introuvable' });
    if (post.userId !== req.user.id && !['admin','superadmin'].includes(req.user.role))
      return res.status(403).json({ error: 'Non autorisé' });
    await post.update({ pinned: !post.pinned });
    getIO()?.to('feed').emit('post_pinned', { postId: post.id, pinned: post.pinned });
    return res.json({ pinned: post.pinned });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /posts/:id/comments ── emit realtime ── */
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Commentaire vide' });
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post introuvable' });
    const comment = await PostComment.create({ postId: post.id, userId: req.user.id, content: content.trim() });
    const full = await PostComment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id','firstName','lastName','avatar','photo'] }]
    });
    getIO()?.to('feed').emit('new_comment', { postId: post.id, comment: full });
    res.status(201).json(full);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
