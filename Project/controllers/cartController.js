const Cart = require('../models/cart');
const Book = require('../models/book');
const asyncWrapper = require('../middleware/asyncWrapper');

const add_to_cart = asyncWrapper(async (req, res) => {
    
    
    const { bookId } = req.body;
    const username = res.locals.username;
    

    let cart = await Cart.findOne({ username: username });
    if (!cart) {
        
        cart = new Cart({ username: username, items: [], totalAmount: 0 });
    } 

    const book = await Book.findById(bookId);
    if (!book) {
        
        return res.status(404).send("Book not found");
    }

    const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

    if (itemIndex > -1) {
        
        cart.items[itemIndex].quantity += 1;
    } else {
        
        cart.items.push({ book: bookId, quantity: 1, price: book.price });
    }

    
    cart.set('totalAmount', cart.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0));

    

    await cart.save();
    const updatedCart = await Cart.findOne({ username: username });
    

    

    res.redirect('/cart');
});



const cart_index = asyncWrapper(async (req, res) => {
    const username = res.locals.username;

    
    const cart = await Cart.findOne({ username: username }).populate('items.book');

    res.render('cart/index', { cart, title: 'Your Cart' });
});

const delete_from_cart = async (req, res) => {
    const username = res.locals.username;

    const { bookId } = req.params; 

    try {
        
        let cart = await Cart.findOne({ username: username });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }

        
        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        
        cart.items.splice(itemIndex, 1);

       
        cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        
        await cart.save();

        
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting item from cart' });
    }
};

module.exports = { add_to_cart, cart_index, delete_from_cart };
