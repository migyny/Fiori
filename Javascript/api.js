// api.js - API Helper Functions
const API_URL = 'http://localhost:3000/api';

// Fetch all products from database
async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch single product by ID
async function fetchProductById(productId) {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Update product stock
async function updateProductStock(productId, quantity) {
  try {
    const response = await fetch(`${API_URL}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity })
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating stock:', error);
    return null;
  }
}