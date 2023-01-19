const testsRouter = require('express').Router()
const Test = require('../models/test')
const User = require('../models/user')
const Post = require('../models/post')

// no posts details
testsRouter.get('/', async(request, response) => {
    const tests = await Test.find({})
    response.json(tests)
})

// no posts details
testsRouter.get('/:id', async(request, response) => {
    const test = await Test.findById(request.params.id)
    if (test) {
        response.json(test)
    } else {
        response.status(404).end()
    }
})

// add a test (admin only)
testsRouter.post('/', async(request, response) => {
    const body = request.body
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token is missing or invalid' })
    }
    if (!user.admin) {
        return response.status(401).json({ error: 'non-admin cannot generate a test!' })
    }

    const test = new Test({
        title: body.title,
        content: body.content,
    })

    const savedTest = await test.save()

    // user.tests = user.tests.concat(savedTest._id)
    // await user.save()

    response.status(201).json(savedTest)
})

// HAS post details
testsRouter.get('/:id/posts', async(request, response) => {
    const test = await Test.findById(request.params.id).populate({
        path: 'posts',
        populate: 'user'
    })

    response.json(test.posts)
})

// POST a post (all user can post solutions to a test)
testsRouter.post('/:id/posts', async(request, response) => {
    const body = request.body
    const user = request.user
    const test = await Test.findById(request.params.id)

    if (!test) {
        return response.status(401).json({ error: 'test id is invalid' })
    }

    if (!user) {
        return response.status(401).json({ error: 'token is missing or invalid' })
    }

    const post = new Post({
        content: body.content,
        date: new Date(),
        user: user._id,
        test: test._id,
    })

    const savedPost = await post.save()

    user.posts = user.posts.concat(savedPost._id)
    await user.save()

    test.posts = test.posts.concat(savedPost._id)
    await test.save()

    response.status(201).json(savedPost)
})

module.exports = testsRouter