const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const cartItemSchema = new Schema({
    book: { 
        type: Schema.Types.ObjectId, 
        ref: 'Book', 
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    price : {
        type : Number,
        required: true

    }
    

});


const cartSchema = new Schema({
    username: { 
        type: String,  
        required: true 
    },

    items: [cartItemSchema], 
    totalAmount: { 
        type: Number,
        required: true,
        
    }
}, { timestamps: true });


const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
