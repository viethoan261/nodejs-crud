const { validationResult } = require('express-validator')

const Post = require('../models/Post');
const User = require('../models/User');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 1;
    let totalItems;
    Post.find().countDocuments().then(count => {
        totalItems = count;
        return Post.find().skip((currentPage - 1) * perPage).limit(perPage);
    }).then(posts => {
        res.status(200).json({
            message: 'All posts',
            posts: posts,
            totalItems: totalItems
        })
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
           const error = new Error('fail to import post');
           error.statusCode = 422;
           throw error;
        } 
        // if (!req.file) {
        //    const error = new Error('no image file provided');
        //    error.statusCode = 422;
        //    throw error;
        // }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    })
    //post.save();
    post.save().then(result => {
       return User.findById(req.userId);
    }).then(user => {
        creator = user;
        console.log(user.posts);
        user.posts.push(post);
        return user.save();
    }).then(result => {
        res.status(201).json(
            {
                message: 'create successfully',
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            }
        )
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        if (!post) {
            const err = new Error('could not find post');
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            message: 'Post fetched',
            post: post
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       const error = new Error('fail to import post');
       error.statusCode = 422;
       throw error;
    } 
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.imageUrl;
    Post.findById(postId).then(post => {
        if (!post) {
            const err = new Error('could not find post');
            err.statusCode = 404;
            throw err;
        }

        if (post.creator.toString() != req.userId) {
            const err = new Error('Not authorized')
            err.statusCode = 403;
            throw err;
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
    }).then(result => {
        res.status(200).json({
            message: 'success',
            post: result
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        if (!post) {
            const err = new Error('could not find post');
            err.statusCode = 404;
            throw err;
        }
        return Post.findByIdAndRemove(postId);
    }).then(result => {
        return User.findById(req.userId);
    }).then(user => {
        user.posts.pull(postId);
        return user.save();
    }).then(result => {
        res.status(200).json({
            message: 'Success'
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}