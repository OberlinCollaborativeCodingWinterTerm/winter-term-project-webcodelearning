const postsRouter = require('express').Router()
const Post = require('../models/post')
const User = require('../models/user')

postsRouter.get('/', async(request, response) => {
    const posts = await Post.find({}).populate('test').populate('user')
    response.json(posts)
})

postsRouter.get('/:id', async(request, response) => {
    const post = await Post.findById(request.params.id).populate('test').populate('user')
    if (post) {
        response.json(post)
    } else {
        response.status(404).end()
    }
})

module.exports = postsRouter
