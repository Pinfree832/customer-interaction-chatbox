const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic routes for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'ÔøΩÔøΩ GripStore API Server is Running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            products: '/api/products',
            auth: '/api/auth'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: '‚úÖ OK', 
        server: 'Running',
        database: 'To be connected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Products API route (basic version)
app.get('/api/products', (req, res) => {
    const sampleProducts = [
        {
            id: 1,
            name: "ProRunner Marathon Shoes",
            price: 129.99,
            category: "running",
            stock: 15,
            image: "fas fa-shoe-prints",
            description: "Professional running shoes for marathon training"
        },
        {
            id: 2,
            name: "Elite Basketball",
            price: 49.99,
            category: "basketball", 
            stock: 25,
            image: "fas fa-basketball-ball",
            description: "Official size professional basketball"
        },
        {
            id: 3,
            name: "Team Soccer Jersey",
            price: 34.99,
            category: "soccer",
            stock: 30,
            image: "fas fa-tshirt",
            description: "Breathable soccer jersey for team games"
        }
    ];
    
    res.json({
        success: true,
        data: sampleProducts,
        count: sampleProducts.length
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n‚ú® ============================================== ‚ú®`);
    console.log(`Ì∫Ä GripStore Server Started Successfully!`);
    console.log(`Ì≥ç Local: http://localhost:${PORT}`);
    console.log(`‚ù§Ô∏è  Health: http://localhost:${PORT}/health`);
    console.log(`Ì≥¶ Products: http://localhost:${PORT}/api/products`);
    console.log(`‚ú® ============================================== ‚ú®\n`);
});
