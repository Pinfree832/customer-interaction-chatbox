// models/Order.js
const db = require('../config/database');

class Order {
    // Create new order
    async create(orderData, userId) {
        return await db.transaction(async (connection) => {
            const {
                items, total_amount, subtotal_amount, tax_amount, shipping_amount,
                discount_amount, payment_method, shipping_address, billing_address,
                customer_note
            } = orderData;

            // Generate order number
            const orderNumber = await this.generateOrderNumber();

            // Create order
            const orderSql = `
                INSERT INTO orders (
                    order_number, user_id, total_amount, subtotal_amount, tax_amount,
                    shipping_amount, discount_amount, payment_method, shipping_address,
                    billing_address, customer_note
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [orderResult] = await connection.execute(orderSql, [
                orderNumber, userId, total_amount, subtotal_amount, tax_amount,
                shipping_amount, discount_amount, payment_method,
                JSON.stringify(shipping_address),
                JSON.stringify(billing_address || shipping_address),
                customer_note
            ]);

            const orderId = orderResult.insertId;

            // Add order items
            for (const item of items) {
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, product_id, variant_id, product_name, 
                        product_price, quantity, total_price
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, item.product_id, item.variant_id, item.product_name,
                    item.product_price, item.quantity, item.total_price
                ]);

                // Update inventory
                if (item.product_id) {
                    await connection.execute(`
                        UPDATE inventory 
                        SET stock_quantity = stock_quantity - ?,
                            reserved_quantity = reserved_quantity - ?
                        WHERE product_id = ?
                    `, [item.quantity, item.quantity, item.product_id]);
                }
            }

            // Add to order history
            await connection.execute(`
                INSERT INTO order_history (order_id, status, created_by)
                VALUES (?, 'pending', ?)
            `, [orderId, userId]);

            return this.findById(orderId);
        });
    }

    // Find order by ID
    async findById(orderId) {
        const sql = `
            SELECT o.*, 
                   JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'product_id', oi.product_id,
                           'product_name', oi.product_name,
                           'product_price', oi.product_price,
                           'quantity', oi.quantity,
                           'total_price', oi.total_price
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.order_id = ?
            GROUP BY o.order_id
        `;

        const orders = await db.query(sql, [orderId]);
        
        if (orders[0]) {
            const order = orders[0];
            order.shipping_address = JSON.parse(order.shipping_address);
            order.billing_address = JSON.parse(order.billing_address);
            order.items = JSON.parse(order.items);
            return order;
        }
        
        return null;
    }

    // Get user's orders
    async findByUser(userId, limit = 20, offset = 0) {
        const sql = `
            SELECT o.* FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `;

        return await db.query(sql, [userId, limit, offset]);
    }

    // Update order status (Admin only)
    async updateStatus(orderId, status, adminId, notes = '') {
        return await db.transaction(async (connection) => {
            // Update order status
            await connection.execute(`
                UPDATE orders SET status = ? WHERE order_id = ?
            `, [status, orderId]);

            // Add to history
            await connection.execute(`
                INSERT INTO order_history (order_id, status, notes, created_by)
                VALUES (?, ?, ?, ?)
            `, [orderId, status, notes, adminId]);

            return this.findById(orderId);
        });
    }

    // Generate unique order number
    async generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        // Get today's order count
        const countSql = `
            SELECT COUNT(*) as count FROM orders 
            WHERE DATE(created_at) = CURDATE()
        `;
        
        const [result] = await db.query(countSql);
        const sequence = String(result.count + 1).padStart(6, '0');
        
        return `GS-${year}${month}-${sequence}`;
    }
}

module.exports = new Order();