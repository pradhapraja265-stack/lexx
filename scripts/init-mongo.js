// MongoDB initialization script for Docker
db = db.getSiblingDB('lexifix');

// Create users collection
db.createCollection('users');

// Create chat sessions collection
db.createCollection('chatsessions');

// Create indexes for better performance
db.users.createIndex({ firebaseUid: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.chatsessions.createIndex({ userId: 1, updatedAt: -1 });
db.chatsessions.createIndex({ createdAt: -1 });
db.chatsessions.createIndex({ 'messages.timestamp': -1 });

// Insert initial data (optional)
// db.users.insertOne({
//   firebaseUid: 'demo_user',
//   email: 'demo@lexifix.com',
//   displayName: 'Demo User',
//   preferences: {
//     theme: 'light',
//     defaultTone: 'professional'
//   },
//   createdAt: new Date(),
//   lastLoginAt: new Date()
// });

print('MongoDB initialized successfully for LexiFix');