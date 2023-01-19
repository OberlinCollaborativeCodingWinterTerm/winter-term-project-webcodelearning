require('dotenv').config()

const PORT = process.env.PORT || 8080
console.log(`PORT of env: ${process.env.PORT}`)

const MONGODB_URI = process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT
}