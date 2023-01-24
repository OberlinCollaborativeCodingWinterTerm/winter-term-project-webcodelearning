const postsRouter = require('express').Router()
const Post = require('../models/post')
const User = require('../models/user')

postsRouter.get('/', async(request, response) => {
    const posts = await Post
        .find({}, {"content": 0, "results": 0})
        .populate('test', {'posts': 0, "testCases": 0, "grades": 0})
        .populate('user', {'posts': 0, "grades": 0})
    response.json(posts)
})

postsRouter.get('/:id', async(request, response) => {
    const user = request.user

    const post = await Post
        .findById(request.params.id)
        .populate('test', {'title': 1})
        .populate('user', {'posts': 0, 'grades': 0})
    
    if (!(user && (user.admin || user.id == post.user.id))) {
        post.content = undefined
        post.results = undefined
    }
        
    if (post) {
        response.json(post)
    } else {
        response.status(404).end()
    }
})

module.exports = postsRouter
