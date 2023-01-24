const testsRouter = require('express').Router()
const Test = require('../models/test')
const User = require('../models/user')
const Post = require('../models/post')
const qs = require('qs')
const axios = require('axios')

// for performance: only show title and id
testsRouter.get('/', async(request, response) => {
    const tests = await Test.find({}, {title: 1})
    response.json(tests)
})

// only show title, content, id (no posts)
testsRouter.get('/:id', async(request, response) => {
    const test = await Test.findById(request.params.id, {posts: 0, testCases: 0 })
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
        testCases: body.testCases,
        grades: {},
    })

    const savedTest = await test.save()

    // user.tests = user.tests.concat(savedTest._id)
    // await user.save()

    response.status(201).json(savedTest)
})

// HAS post details (except content)
testsRouter.get('/:id/posts', async(request, response) => {
    const user = request.user
    const includeContent = (user && user.admin) ? 
        {}:
        {content: 0}

    const posts = await Post
        .find({test: request.params.id}, includeContent)
        .populate('user', {name: 1, username: 1, admin: 1})

    response.json(posts)
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

    if (!body.content) {
        return response.status(401).json({ error: 'content is missing' })
    }

    // GRADING START
    const data = (inputString) => qs.stringify({
        'code': body.content,
        'language': 'py',
        'input': inputString,
    })

    const config = (inputString) => {
        return {
            method: 'post',
            url: 'https://api.codex.jaagrav.in',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data(inputString)
        }
    }

    let results = []
    let grade = 0

    for (let i = 0; i < test.testCases.length; ++i) {
        // console.log(`testCase ${i}:`)
        try {
            const response = await axios(config(test.testCases[i].input))

            if (response.data.error) {
                // console.log(`compile error: ${response.data.error}`)
                results.push({ success: false, message: `compile error: ${response.data.error}`})
            } else if (response.data.output.trim() == test.testCases[i].output) {
                // console.log(`test passed, outputing ${response.data.output.trim()}`)
                results.push({ success: true, message: `matched results`})
                grade++
            } else {
                // console.log(`test failed, expected ${test.testCases[i].output} but outputted ${response.data.output.trim()}`)
                results.push({ success: false, message: `unmatched results: expected ${test.testCases[i].output} but outputted ${response.data.output.trim()}`})
            }
            // console.log(response.data)
        }
        catch (error) {
            // console.log(error)
            results.push({ success: false, message: "time limit exceeded"})
        }
    }

    grade = Math.round(grade / results.length * 10000) / 100

    console.log(grade)
    
    // save results
    const post = new Post({
        content: body.content,
        date: new Date(),
        user: user._id,
        test: test._id,
        results: results,
        grade: grade,
    })

    const savedPost = await post.save()

    user.posts = user.posts.concat(savedPost._id)
    test.posts = test.posts.concat(savedPost._id)

    const pastGrade = user.grades.get(test._id.toString()) || 0
    if (pastGrade < grade) {
        user.grades.set(test._id.toString(), grade)
        test.grades.set(user._id.toString(), grade)
    }

    await user.save()
    await test.save()

    response.status(201).json(savedPost)
})

module.exports = testsRouter