const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',          // Change to your MySQL username
  password: 'dangsql',  // Change to your MySQL password
  database: 'FioriDB'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database!');
});

// ============= API ENDPOINTS =============

// GET all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM Products ORDER BY product_id';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`✅ Fetched ${results.length} products`);
    res.json(results);
  });
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
  const query = 'SELECT * FROM Products WHERE product_id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    console.log(`✅ Fetched product: ${results[0].name}`);
    res.json(results[0]);
  });
});

// GET predesigned bouquet with product details
app.get('/api/bouquets/:productId', (req, res) => {
  const query = `
    SELECT b.*, p.name, p.price, p.stock, p.image, p.description
    FROM Predesigned_Bouquet b
    JOIN Products p ON b.product_id = p.product_id
    WHERE p.product_id = ?
  `;
  
  db.query(query, [req.params.productId], (err, results) => {
    if (err) {
      console.error('Error fetching bouquet:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Bouquet not found' });
      return;
    }
    console.log(`✅ Fetched bouquet: ${results[0].name}`);
    res.json(results[0]);
  });
});

// ============= SAVE ORDER ENDPOINT (Checkout) =============
app.post('/api/orders', (req, res) => {
  const { customerId, items, total } = req.body;
  const orderId = 'ORD-' + Date.now();
  const orderDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Create Order
  const orderQuery = 'INSERT INTO Orders (order_id, customer_id, order_date, total_amount, status) VALUES (?, ?, ?, ?, ?)';
  
  db.query(orderQuery, [orderId, customerId, orderDate, total, 'Pending'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Add Items to Order_Product
    // We loop through items and insert them one by one
    const itemQueries = items.map(item => {
      return new Promise((resolve, reject) => {
        const itemQuery = 'INSERT INTO Order_Product (order_id, product_id, quantity) VALUES (?, ?, ?)';
        db.query(itemQuery, [orderId, item.id, item.quantity], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    // Wait for all items to save
    Promise.all(itemQueries)
      .then(() => res.json({ message: 'Order placed', orderId }))
      .catch(err => res.status(500).json({ error: 'Error saving items' }));
  });
});

// ============= GET ORDER HISTORY ENDPOINT =============
app.get('/api/orders/:customerId', (req, res) => {
  const customerId = req.params.customerId;

  const query = `
    SELECT o.order_id, o.order_date, o.total_amount, o.status,
           p.name as product_name, p.price, op.quantity
    FROM Orders o
    JOIN Order_Product op ON o.order_id = op.order_id
    JOIN Products p ON op.product_id = p.product_id
    WHERE o.customer_id = ?
    ORDER BY o.order_date DESC
  `;

  db.query(query, [customerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Group the rows into structured orders
    const orders = {};
    results.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          id: row.order_id,
          date: row.order_date,
          total: row.total_amount,
          status: row.status,
          items: []
        };
      }
      orders[row.order_id].items.push({
        name: row.product_name,
        price: row.price,
        quantity: row.quantity
      });
    });

    res.json(Object.values(orders));
  });
});

// UPDATE product stock (when item is purchased)
app.patch('/api/products/:id/stock', (req, res) => {
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: 'Invalid quantity' });
    return;
  }
  
  // First check if enough stock
  const checkQuery = 'SELECT stock FROM Products WHERE product_id = ?';
  db.query(checkQuery, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    if (results[0].stock < quantity) {
      res.status(400).json({ error: 'Not enough stock' });
      return;
    }
    
    // Update stock
    const updateQuery = 'UPDATE Products SET stock = stock - ? WHERE product_id = ?';
    db.query(updateQuery, [quantity, req.params.id], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`✅ Updated stock for product ${req.params.id}`);
      res.json({ message: 'Stock updated successfully' });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register new user
app.post('/api/register', (req, res) => {
  const { name, email, password, address, phone } = req.body;

  // 1. Generate a unique ID (Simple timestamp method)
  const customer_id = 'CUST-' + Date.now();

  // 2. Prepare SQL Query
  const query = 'INSERT INTO Customer (customer_id, name, email, password, address, phone) VALUES (?, ?, ?, ?, ?, ?)';
  
  // 3. Execute Query
  db.query(query, [customer_id, name, email, password, address, phone || null], (err, result) => {
    if (err) {
      // Handle duplicate email error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'This email is already registered.' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`✅ New user registered: ${name}`);
    res.json({ message: 'User registered successfully', customerId: customer_id });
  });
});

// User login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Query database for user with matching email AND password
  const query = 'SELECT * FROM Customer WHERE email = ? AND password = ?';
  
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // If no user found, results array will be empty
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Success! Get the first user found
    const user = results[0];

    // Respond with user data (excluding password for security)
    res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        address: user.address, // Note: This comes from DB as a single string
        phone: user.phone,
        customerId: user.customer_id
      }
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/products`);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  db.end();
  console.log('\n👋 Database connection closed');
  process.exit();
});
