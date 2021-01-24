const express = require('express')
const Author = require('../models/author')
const router = express.Router()  
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg','image/png','image/gif']

//All Books routes
router.get('/',async(req,res)=> {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title',new RegExp(req.query.title,'i'))
    }
    if(req.query.publishedbefore != null && req.query.publishedbefore != ''){
        query = query.lte('publishedDate',req.query.publishedbefore)
    }
    if(req.query.publishedafter != null && req.query.publishedafter != ''){
        query = query.gte('publishedDate',req.query.publishedafter)
    }
    try {
        const books = await query.exec()
        books.forEach(book=>{
            console.log(book.publishedDate)
        })
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
} )

//New Book Routes
router.get('/new',async(req,res)=>{
    renderNewPage(res,new Book())
})

//Create Books
router.post('/',async(req,res)=>{
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })

    if(req.body.cover != null && req.body.cover !== ''){
        savecover(book,req.body.cover)
    }

    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch (error) {
        renderNewPage(res,book,true)
    }
})



async function renderNewPage(res,book,hasError= false){
    renderFormPage(res,book,'new',hasError)
}

async function renderEditPage(res,book,hasError= false){
    renderFormPage(res,book,'edit',hasError)
}

async function renderFormPage(res,book,form,hasError= false){
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError){
            if(form === 'edit'){
                params.errorMessage = 'Error Updating the book'
            }
            else {
                params.errorMessage = 'Error Creating the book'
            }
        }
        
        res.render(`books/${form}`,params)
    } catch (error) {
        res.redirect('/books')
    }
}


function savecover(book,coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data,'base64')
        book.coverImageType = cover.type
    }
}

//show Book Route
router.get('/:id',async(req,res)=>{
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show',{book: book})
    } catch (error) {
        res.redirect('/')
    }
})

//Edit Book Route
router.get('/:id/edit',async(req,res)=>{
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res,book)
    } catch (error) {
        res.redirect('/')
    }
})

//Update Book Route
router.put('/:id',async(req,res)=>{
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishedDate = new Date(req.body.publishedDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            savecover(book,req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        if(book != null){
            renderEditPage(res,book,true)
        } else {
            res.redirect('/')
        }
    }
})

//Delete book route
router.delete('/:id',async (req,res)=>{
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if(book != null){
           res.render('books/show',{
               book: book,
               errorMessage: 'could not remove book'
           }) 
        } else{
            res.redirect('/')
        }        
    }
})



module.exports =  router