const express = require('express');
const { body } = require("express-validator");
const router = express.Router();

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

//GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

router.post('/posts', isAuth, [
    body('title').trim().isLength({min: 5}),
    body ('content').trim().isLength({min: 6})
], feedController.createPost);

router.get('/posts/:postId', isAuth, feedController.getPost);
router.put('/posts/:postId',[
    body('title').trim().isLength({min: 5}),
    body ('content').trim().isLength({min: 6})
], feedController.updatePost);
router.delete('/posts/:postId', isAuth, feedController.deletePost);

module.exports = router;