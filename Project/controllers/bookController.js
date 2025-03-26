const Book = require('../models/book');
const User = require('../models/user'); 
const asyncWrapper = require('../middleware/asyncWrapper');
const transporter = require('../mailer');


const book_index = asyncWrapper(async (req, res) => {
    
    const searchQuery = req.query.searchbar || '';  

    
    const categoryFilter = req.query.category || '';  

    
    let filter = {
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { author: { $regex: searchQuery, $options: 'i' } }
        ]
    };

    
    if (categoryFilter) {
        filter.category = { $regex: categoryFilter, $options: 'i' };  
    }


    
    const books = await Book.find(filter);

    
    res.render('books/index', { books, title: 'Books' });
});


const book_create = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated || !req.session.user.isAdmin) {
        return res.redirect('/books');
    }
    if(!req.body.isBestSeller) req.body.isBestSeller = false;
    else req.body.isBestSeller = true;
    const book = await Book.create(req.body);

    
    const users = await User.find({}, 'email'); 
    const emailAddresses = users.map(user => user.email); 

    const mailOptions = {
        from: 'shanie15@ethereal.email', 
        to: emailAddresses.join(','), 
        subject: 'Új könyv érkezett!',
        text: `A(z) ${book.title} könyv megjelent!`
    };

    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`Hiba az e-mail küldése során: ${error}`);
        } else {
            console.log(`E-mail sikeresen elküldve az összes felhasználónak: ${info.response}`);
        }
    });
    return res.redirect('/admin?status=created');
});


const editBook = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated || !req.session.user.isAdmin) {
        return res.redirect('/books');
    }
    const { id } = req.params;
    const book = await Book.findById(id);
    res.render('books/editbook', { book, title: 'Edit Book'});
});


const createBookPage = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated || !req.session.user.isAdmin) {
        return res.redirect('/books');
    }
    res.render('books/createbook', {title: 'Create Book'});
});


const updateBook = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated || !req.session.user.isAdmin) {
        return res.redirect('/books');
    }
    const { id } = req.params;
    if(!req.body.isBestSeller) req.body.isBestSeller = false;
    else req.body.isBestSeller = true;


    const result = await Book.findByIdAndUpdate(id, req.body, { new: true });
    if (!result) {
        return res.status(404).send('Book not found');
    }
    res.status(200).json({message:'Data updated successfully'});
});


const deleteBook = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated || !req.session.user.isAdmin) {
        return res.redirect('/books');
    }
    const { id } = req.params;
    const result = await Book.findByIdAndDelete(id);

    if (!result) {
        return res.status(404).send('Book not found');
    }
    res.status(200).send('Book deleted successfully');
});


const bestsellers = asyncWrapper(async (req, res) => {
    const books = await Book.find();
    res.render('books/bestsellers', { books, title: 'Bestsellers'});
});


const getsinglebook = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
        return res.status(404).send('Book not found');
    }

    res.render('books/singlebook', { book, title: book.title, loggedin: req.session.isLoggedIn || false });
});


module.exports = {
    book_index,
    book_create,
    editBook,
    createBookPage,
    updateBook,
    deleteBook,
    bestsellers,
    getsinglebook
};
