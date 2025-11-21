// models/Product.js
const db = require('../config/database');

class Product {
    // Create new product (Admin only)
    async create(productData, adminId) {
        const {
            name, description, short_description, sku, category_id, brand,
            price, compare_price, cost_price, featured_image_url, image_gallery,
            icon_class, specifications, features, weight_kg, dimensions,
            is_featured = false, meta_title, meta_description, tags
        } = productData;

        const sql = `
            INSERT INTO products (
                name, description, short_description, sku, category_id, brand,
                price, compare_price, cost_price, featured_image_url, image_gallery,
                icon_class, specifications, features, weight_kg, dimensions,
                is_featured, meta_title, meta_description, tags, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.query(sql, [
            name, description, short_description, sku, category_id, brand,
            price, compare_price, cost_price, featured_image_url, 
            JSON.stringify(image_gallery || []),
            icon_class, 
            JSON.stringify(specifications || {}),
            JSON.stringify(features || []),
            weight_kg, 
            JSON.stringify(dimensions || {}),
            is_featured, meta_title, meta_description,
            JSON.stringify(tags || []),
            adminId
        ]);

        // Create inventory entry
        await this.createInventory(result.insertId, 0);

        return this.findById(result.insertId);
    }

    // Get product by ID
    async findById(productId) {
        const sql = `
            SELECT p.*, c.name as category_name, i.stock_quantity, i.stock_status,
                   u.first_name as created_by_name, u.last_name as created_by_last_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN inventory i ON p.product_id = i.product_id
            LEFT JOIN users u ON p.created_by = u.user_id
            WHERE p.product_id = ? AND p.is_active = TRUE
        `;
        const products = await db.query(sql, [productId]);
        
        if (products[0]) {
            return this.formatProduct(products[0]);
        }
        return null;
    }

    // Get all products with filters
    async findAll(filters = {}) {
        let sql = `
            SELECT p.*, c.name as category_name, i.stock_quantity, i.stock_status
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN inventory i ON p.product_id = i.product_id
            WHERE p.is_active = TRUE
        `;
        
        const values = [];
        const conditions = [];

        // Apply filters
        if (filters.category_id) {
            conditions.push('p.category_id = ?');
            values.push(filters.category_id);
        }

        if (filters.brand) {
            conditions.push('p.brand = ?');
            values.push(filters.brand);
        }

        if (filters.min_price) {
            conditions.push('p.price >= ?');
            values.push(filters.min_price);
        }

        if (filters.max_price) {
            conditions.push('p.price <= ?');
            values.push(filters.max_price);
        }

        if (filters.search) {
            conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)');
            values.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.is_featured !== undefined) {
            conditions.push('p.is_featured = ?');
            values.push(filters.is_featured);
        }

        if (conditions.length > 0) {
            sql += ` AND ${conditions.join(' AND ')}`;
        }

        // Sorting
        const sortOptions = {
            'newest': 'p.created_at DESC',
            'price_low': 'p.price ASC',
            'price_high': 'p.price DESC',
            'name': 'p.name ASC',
            'popular': 'i.stock_quantity DESC' // Example popularity metric
        };

        sql += ` ORDER BY ${sortOptions[filters.sort_by] || 'p.created_at DESC'}`;

        // Pagination
        if (filters.limit) {
            sql += ' LIMIT ?';
            values.push(filters.limit);
        }

        if (filters.offset) {
            sql += ' OFFSET ?';
            values.push(filters.offset);
        }

        const products = await db.query(sql, values);
        return products.map(product => this.formatProduct(product));
    }

    // Update product (Admin only)
    async update(productId, updateData) {
        const allowedFields = [
            'name', 'description', 'short_description', 'category_id', 'brand',
            'price', 'compare_price', 'cost_price', 'featured_image_url', 'image_gallery',
            'icon_class', 'specifications', 'features', 'weight_kg', 'dimensions',
            'is_featured', 'meta_title', 'meta_description', 'tags'
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates.push(`${field} = ?`);
                
                // Handle JSON fields
                if (['image_gallery', 'specifications', 'features', 'dimensions', 'tags'].includes(field)) {
                    values.push(JSON.stringify(updateData[field]));
                } else {
                    values.push(updateData[field]);
                }
            }
        }

        if (updates.length === 0) {
            return this.findById(productId);
        }

        values.push(productId);
        const sql = `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?`;
        
        await db.query(sql, values);
        return this.findById(productId);
    }

    // Delete product (soft delete)
    async delete(productId) {
        const sql = `UPDATE products SET is_active = FALSE WHERE product_id = ?`;
        await db.query(sql, [productId]);
        return true;
    }

    // Inventory management
    async updateStock(productId, newQuantity) {
        const sql = `
            UPDATE inventory 
            SET stock_quantity = ?, 
                stock_status = CASE 
                    WHEN ? = 0 THEN 'out_of_stock'
                    WHEN ? <= low_stock_threshold THEN 'low_stock' 
                    ELSE 'in_stock' 
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
        `;
        
        await db.query(sql, [newQuantity, newQuantity, newQuantity, productId]);
        return this.findById(productId);
    }

    // Helper method to format product data
    formatProduct(product) {
        return {
            ...product,
            image_gallery: JSON.parse(product.image_gallery || '[]'),
            specifications: JSON.parse(product.specifications || '{}'),
            features: JSON.parse(product.features || '[]'),
            dimensions: JSON.parse(product.dimensions || '{}'),
            tags: JSON.parse(product.tags || '[]')
        };
    }

    // Create inventory entry
    async createInventory(productId, initialStock = 0) {
        const sql = `
            INSERT INTO inventory (product_id, stock_quantity, stock_status)
            VALUES (?, ?, ?)
        `;
        
        const stockStatus = initialStock > 0 ? 'in_stock' : 'out_of_stock';
        await db.query(sql, [productId, initialStock, stockStatus]);
    }
}

module.exports = new Product();