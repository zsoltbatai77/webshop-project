const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title:{
        type : String,
        required : true
    },

    author: {
        type : String,
        required : true
    },

    price: {
        type : Number,
        required : true
    },

    year: {
        type : Number,
        required : true
    },

    category: {
        type : String,
        required : true
    },

    description:{
        type: String,
        required : true
    },

    rating:{
        type: Number,
        required : true
    },

    isBestSeller:{
        type: Boolean,
        required : true
    },

    imagePath:{
        type: String,
        required: false
    }


}, { timestamps : true });


const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
