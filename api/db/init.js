import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const status = [];
  try {
    // 1. Ensure gandouras table exists
    await sql`
      CREATE TABLE IF NOT EXISTS gandouras (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50),
        color_name VARCHAR(100),
        image_url TEXT,
        stock_initial INT DEFAULT 1,
        stock_sold INT DEFAULT 0,
        measurements JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    status.push('Table "gandouras" checked/created.');

    // 2. Add image_urls column if it doesn't exist
    try {
      await sql`ALTER TABLE gandouras ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;`;
      status.push('Column "image_urls" added/verified.');
    } catch (e) {
      console.error('Error adding image_urls:', e);
      status.push('Error adding "image_urls": ' + e.message);
    }

    // 3. Ensure sales table exists
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) REFERENCES gandouras(id) ON DELETE CASCADE,
        sale_price NUMERIC(10, 2) NOT NULL,
        cost NUMERIC(10, 2) DEFAULT 50.00,
        profit NUMERIC(10, 2) NOT NULL,
        sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    status.push('Table "sales" checked/created.');

    return res.status(200).json({ 
      success: true, 
      message: 'Database initialization complete.',
      details: status
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return res.status(500).json({ 
      error: error.message,
      details: status
    });
  }
}
