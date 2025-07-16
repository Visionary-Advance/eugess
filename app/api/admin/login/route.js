// app/api/admin/login/route.js
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Simple admin credentials (you should use environment variables)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    // Verify credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate a simple token (in production, use proper JWT)
    const token = crypto.randomBytes(32).toString('hex');

    return Response.json({ 
      success: true, 
      token,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}