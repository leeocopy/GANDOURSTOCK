import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'gandoura2026';
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_gandoura_2026';

    if (
      username.trim().toLowerCase() === adminUser.toLowerCase() &&
      password === adminPass
    ) {
      const token = jwt.sign({ role: 'owner', username: adminUser }, jwtSecret, { expiresIn: '7d' });
      return res.status(200).json({ success: true, token, user: { username: adminUser, role: 'owner' } });
    }

    return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
