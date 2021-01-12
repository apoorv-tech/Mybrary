const express = require('express')
const Author = require('../models/author')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const Book = require('../models/book')
const uploadPath = path.join('public',Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg','image/png','image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req,file,callback)=>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})

const fs = require('fs')

//All Books routes
router.get('/',async(req,res)=> {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title',new RegExp(req.query.title,'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishedDate',req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishedDate',req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
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
router.post('/',upload.single('cover'),async(req,res)=>{
    const filename= req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName: filename
    })
    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch (error) {
        if(book.coverImageName != null){
           removeBookCover(book.coverImageName)
        }
        renderNewPage(res,book,true)
    }
})


function removeBookCover(filename){
    fs.unlink(path.join(uploadPath,filename),err => {
        if(err) console.error(err)
    })
}


async function renderNewPage(res,book,hasError= false){
    try {
        const authors = await Author.find({})
        const book = new Book()
        const params = {
            authors: authors,
            book: book
        }
        if(hasError)params.errorMessage = 'Error creating the book'
        
        res.render('books/new',params)
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports =  router