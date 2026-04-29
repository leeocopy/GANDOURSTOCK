import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM gandouras ORDER BY created_at DESC;`;
      // Map database schema back to frontend model
      const products = rows.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        colorName: row.color_name,
        imageUrl: row.image_url,
        stockInitial: row.stock_initial,
        stockSold: row.stock_sold,
        units: row.measurements || [],
        createdAt: row.created_at,
      }));
      return res.status(200).json(products);
    } 
    
    else if (req.method === 'POST') {
      const p = req.body;
      const id = p.id || `gnd-${Date.now()}`;
      await sql`
        INSERT INTO gandouras (id, name, color, color_name, image_url, stock_initial, stock_sold, measurements, created_at)
        VALUES (${id}, ${p.name}, ${p.color}, ${p.colorName}, ${p.imageUrl}, ${p.stockInitial}, ${p.stockSold || 0}, ${JSON.stringify(p.units)}, NOW())
      `;
      return res.status(201).json({ success: true, id });
    } 
    
    else if (req.method === 'PUT') {
      const p = req.body;
      if (!p.id) return res.status(400).json({ error: 'Missing ID' });

      // If updating the whole product vs just selling one
      if (p.action === 'sell') {
        const soldCount = p.stockSold;
        await sql`UPDATE gandouras SET stock_sold = ${soldCount} WHERE id = ${p.id}`;
      } else {
        await sql`
          UPDATE gandouras 
          SET name = ${p.name}, color = ${p.color}, color_name = ${p.colorName}, image_url = ${p.imageUrl}, stock_initial = ${p.stockInitial}, measurements = ${JSON.stringify(p.units)}
          WHERE id = ${p.id}
        `;
      }
      return res.status(200).json({ success: true });
    } 
    
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });
      await sql`DELETE FROM gandouras WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
