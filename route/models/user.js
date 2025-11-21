// models/User.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    async create(userData) {
        const {
            email, password, role = 'customer', 
            first_name, last_name, phone, preferred_language = 'en'
        } = userData;

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (email, password_hash, role, first_name, last_name, phone, preferred_language)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await db.query(sql, [
            email, password_hash, role, first_name, last_name, phone, preferred_language
        ]);

        return this.findById(result.insertId);
    }

    // Find user by ID
    async findById(userId) {
        const sql = `SELECT * FROM users WHERE user_id = ? AND is_active = TRUE`;
        const users = await db.query(sql, [userId]);
        return users[0] || null;
    }

    // Find user by email
    async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ? AND is_active = TRUE`;
        const users = await db.query(sql, [email]);
        return users[0] || null;
    }

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update user profile
    async update(userId, updateData) {
        const allowedFields = ['first_name', 'last_name', 'phone', 'preferred_language', 'profile_image_url'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(updateData[field]);
            }
        }

        if (updates.length === 0) {
            return this.findById(userId);
        }

        values.push(userId);
        const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
        
        await db.query(sql, values);
        return this.findById(userId);
    }

    // Admin: Get all users
    async findAll(limit = 50, offset = 0) {
        const sql = `
            SELECT user_id, email, role, first_name, last_name, phone, 
                   preferred_language, is_active, created_at, last_login
            FROM users 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        return await db.query(sql, [limit, offset]);
    }
}

module.exports = new User();