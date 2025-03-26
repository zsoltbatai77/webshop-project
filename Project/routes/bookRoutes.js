const express = require('express');
const bodyParser = require('body-parser');
const bookController = require('../controllers/bookController');
const router = express.Router();


router.get('/', bookController.book_index);


router.get('/editbook/:id', bookController.editBook);


router.get('/createbook', bookController.createBookPage);


router.post('/create', bookController.book_create);

router.put('/update/:id', bodyParser.urlencoded({ extended: false }), bookController.updateBook);


router.delete('/delete/:id', bookController.deleteBook);


router.get('/bestsellers', bookController.bestsellers);


router.get('/:id', bookController.getsinglebook);

module.exports = router;