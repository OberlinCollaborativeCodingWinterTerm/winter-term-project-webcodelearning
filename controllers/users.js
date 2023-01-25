const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async(request, response) => {
    const users = await User.find({}).populate('posts', {"date": 1, "test": 1})
    response.json(users)
})

usersRouter.get('/:id', async(request, response) => {
    const user = await User
        .findById(request.params.id)
        .populate({
            path: 'posts',
            populate: {
                path: 'test',
                select: {title: 1},
            },
            select: {date: 1, test: 1, grade: 1},
        })
        
    if (!user) {
        response.status(404).end()
    }
    else {
        response.json(user)
    }
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password, adminCode } = request.body

    if (password === undefined || password.length < 3) {
        return response.status(400).json({
            error: 'password must be available and at least 3 characters long'
        })
    }

    if (adminCode && adminCode !== process.env.ADMIN_CODE) {
        return response.status(400).json({
            error: 'admin code is submitted but incorrect, are you an imposter?'
        })
    }

    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
        admin: adminCode === process.env.ADMIN_CODE,
        grades: {},
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = usersRouter
