// This middleware verifies Firebase tokens
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Middleware function to verify JWT token
async function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Get token after "Bearer "

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,      // Firebase user ID
      email: decodedToken.email,
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticateToken, admin };