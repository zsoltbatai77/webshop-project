document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', function () {
        const bookId = this.dataset.bookId;
        const action = this.classList.contains('plus') ? 'increase' : 'decrease';
        updateQuantity(bookId, action);
    });
});

function updateQuantity(bookId, action) {
    const quantityDisplay = document.querySelector(`[data-book-id="${bookId}"]`).parentElement.querySelector('.quantity-display');
    let currentQuantity = parseInt(quantityDisplay.textContent);

    
    if (action === 'increase') {
        currentQuantity++;
    } else if (action === 'decrease' && currentQuantity > 1) {
        currentQuantity--;
    }

   
    quantityDisplay.textContent = currentQuantity;

    
    fetch(`/cart/update/${bookId}`, {  
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            quantity: currentQuantity,  
        }),
    })
        .then(response => {
            
            if (!response.ok) {
                throw new Error('Failed to update cart');
            }
            return response.json();
        })
        .then(data => {
            console.log('Cart updated', data);
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


