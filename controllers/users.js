const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async(request, response) => {
    const users = await User.find({}).populate('posts')
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password, adminCode } = request.body

    if (password === undefined || password.length < 3) {
        response.status(400).json({
            error: 'password must be available and at least 3 characters long'
        })
    }

    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
        admin: adminCode === process.env.ADMIN_CODE
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = usersRouter
