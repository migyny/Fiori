// Shopping Cart System
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.init();
  }

  init() {
    // Create cart HTML
    this.createCartHTML();
    // Update cart display
    this.updateCart();
  }

  createCartHTML() {
    const cartHTML = `
      <!-- Cart Overlay -->
      <div id="cart-overlay" class="cart-overlay" onclick="closeCart()"></div>
      
      <!-- Cart Sidebar -->
      <div id="cart-sidebar" class="cart-sidebar">
        <!-- Cart Header -->
        <div class="cart-header">
          <h2 class="cart-title">Cart</h2>
          <button class="cart-close-btn" onclick="closeCart()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#292D32" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Cart Items -->
        <div id="cart-items-container" class="cart-items-container">
          <!-- Items will be inserted here -->
        </div>

        <!-- Cart Footer -->
        <div class="cart-footer">
          <div class="cart-total">
            <span class="total-label">Total:</span>
            <span id="cart-total-price" class="total-price">$0.00</span>
          </div>
          <button class="checkout-btn" onclick="checkout()">Checkout</button>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', cartHTML);
  }

  loadCart() {
    const saved = localStorage.getItem('fioriCart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('fioriCart', JSON.stringify(this.items));
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      this.items.push(product);
    }
    
    this.saveCart();
    this.updateCart();
    this.showNotification('Item added to cart!');
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCart();
  }

  updateQuantity(productId, newQuantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, newQuantity);
      this.saveCart();
      this.updateCart();
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  updateCart() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');
    
    if (!container) return;

    // Update cart icon badge
    this.updateCartBadge();

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <p>Your cart is empty</p>
        </div>
      `;
      totalElement.textContent = '$0.00';
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-price">${item.price}</p>
          <div class="cart-item-quantity">
            <button class="qty-btn-small" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn-small" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <button class="remove-btn" onclick="cart.removeItem('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');

    totalElement.textContent = `$${this.getTotal().toFixed(2)}`;
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const count = this.getItemCount();
    
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Global cart instance
let cart;

// Initialize cart when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
  });
} else {
  cart = new ShoppingCart();
}

// Cart UI Functions
function openCart() {
  document.getElementById('cart-overlay').classList.add('active');
  document.getElementById('cart-sidebar').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('active');
  document.getElementById('cart-sidebar').classList.remove('active');
  document.body.style.overflow = '';
}

function checkout() {
  if (cart.items.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  //save latest cart's status
  cart.saveCart();
  
  window.location.href = "../html/checkout.html";
  //alert(`Checkout - Total: $${cart.getTotal().toFixed(2)}\n\nThis would redirect to checkout page.`);
  // Here you would redirect to checkout page or process payment
}

// Add to cart from product detail page
function addToCartFromDetail() {
  const productId = getProductId();
  const quantity = parseInt(document.getElementById('quantity').textContent);
  
  // Get product info from the products object
  const product = products[productId];
  
  if (product) {
    cart.addItem({
      id: productId,
      name: product.name,
      price: product.price,
      quantity: quantity
    });
    
    openCart();
  }
}
