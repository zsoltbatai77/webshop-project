const express = require('express');
const router = express.Router();
const { add_to_cart, cart_index, delete_from_cart } = require('../controllers/cartController');
const Cart = require('../models/cart');

router.post('/add', add_to_cart);

router.get('/', cart_index);

router.post('/update/:bookId', async (req, res) => {
    if (!req.params.bookId) {
        return res.status(400).json({ message: 'Missing bookId parameter' });
    }

    const { bookId } = req.params; 
    const { quantity } = req.body; 

    
    if (!bookId || quantity < 1) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        const username = res.locals.username;
        
        let cart = await Cart.findOne({ username: username }).populate('items.book');

        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }

        
        const itemIndex = cart.items.findIndex(item => item.book._id.toString() === bookId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

       
        cart.items[itemIndex].quantity = quantity;

        
        cart.totalAmount = cart.items.reduce((total, item) => {
            const price = parseFloat(item.book.price);  
            const qty = parseInt(item.quantity, 10);    

            if (isNaN(price) || isNaN(qty)) {
                console.warn('Invalid price or quantity for item:', item);
                return total;  
            }

            return total + price * qty;
        }, 0);

        
        await cart.save();

        
        res.json({ newTotalAmount: cart.totalAmount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating cart' });
    }
});

router.post('/delete/:bookId', delete_from_cart);


module.exports = router;
