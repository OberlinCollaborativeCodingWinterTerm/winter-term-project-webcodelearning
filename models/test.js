const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    testCases: {
        type: [
            {
                input: String,
                output: { type: String, required: true },
            }
        ],
        required: true,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }
    ],
    // user id to grade
    grades: {
        type: Map,
        // of: Number,
        required: true,
    },
})

testSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        if (returnedObject._id) returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Test = mongoose.model('Test', testSchema)

module.exports = Test