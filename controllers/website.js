const path = require('path')
const websiteRouter = require('express').Router()

websiteRouter.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

websiteRouter.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

websiteRouter.get('/tests', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

websiteRouter.get('/tests/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

websiteRouter.get('/users/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

websiteRouter.get('/posts/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

module.exports = websiteRouter