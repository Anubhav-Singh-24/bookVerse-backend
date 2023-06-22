const express = require('express')
const router = express.Router()
const Books = require('../models/Books')
const fetchuser = require('../middlewares/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1: Fetching all the books of a user using Get at endpoint "/api/books/fetchallbooks"
router.get('/fetchallbooks', fetchuser, async (req, res) => {
    try {
        const books = await Books.find({ user: req.user.id })
        res.json(books)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }
})


// Route 2: Adding books of a user using Post at endpoint "/api/books/addbook"
router.post('/addbook', fetchuser, [
    // Validating the entered book details
    body('title', 'Title cannot be blank').isLength({ min: 5 }),
    body('author', 'Author cannot be blank').isLength({ min: 5 }),
    body('genre', 'Genre cannot be blank').isLength({ min: 5 }),
    body('status', 'Status cannont be blank').isLength({ min: 4 })
], async (req, res) => {
    try {
        // Destructuring the titles, descriptions, etc from the request body
        const { title, description, author, genre, status } = req.body
        // If their is some error return badrequest and the error
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() })
        }
        const book = new Books({
            title, description, author, genre, status, user: req.user.id
        })

        // Saving the books details in our database
        const savedBook = await book.save()
        res.json(savedBook)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }
})

// Route 3: Update the details of an existing book using Put at endpoint "/api/books/updatebook"
router.put('/updatebook/:id', fetchuser, async (req, res) => {
    try {
        const { title, status, description, genre, author } = req.body

        const updatedBook = {}
        // If their are value to update in the form then update it
        if (title) { updatedBook.title = title; }
        if (status) { updatedBook.status = status; }
        if (description) { updatedBook.description = description; }
        if (genre) { updatedBook.genre = genre; }
        if (author) { updatedBook.author = author; }

        // Finding if the book we need to update exists in the database or not
        let book = await Books.findById(req.params.id)
        if (!book) {
            return res.status(404).send("Not found");
        }

        // Checking if the user is not updating someone else's book details
        if (book.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        // Updating the book
        book = await Books.findByIdAndUpdate(req.params.id, { $set: updatedBook }, { new: true })
        res.json({ book })

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }
})

// Route 4: Delete an existing book using Delete at end point "/api/books/deletebook/:id"
router.delete('/deletebook/:id', fetchuser, async (req, res) => {
    try {

        // Finding if the book we need to delete exists in the database or not
        let book = await Books.findById(req.params.id)
        if (!book) {
            return res.status(404).send("Not found");
        }

        // Checking if the user is not deleting someone else's book 
        if (book.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        // delete the book
        book = await Books.findByIdAndDelete(req.params.id)
        res.json({ "Success":"Removed the book from your library" })

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }
})

module.exports = router;