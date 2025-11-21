// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

// Import database (this will initialize the connection)
require('./config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'GripStore API is running', 
        timestamp: new Date().toISOString() 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 GripStore server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
// Add this to your existing server.js
const adminRoutes = require('./routes/admin'); // If you have admin routes

// Then add this with your other routes
app.use('/api/admin', adminRoutes);
// Add to server.js after imports
const db = require('./config/database');

// Update health check to show database status
app.get('/health', (req, res) => {
    const dbStatus = db.state === 'authenticated' ? 'Connected' : 'Disconnected';
    
    res.json({ 
        status: '✅ OK', 
        server: 'Running',
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development'
    });
});