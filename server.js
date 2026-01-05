import express from 'express';

const app = express();
app.use(express.json());

// Example in-memory users store for demonstration
const users = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

// Safe handler: return 404 when user not found and catch unexpected errors
app.get('/api/users/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ name: user.name, email: user.email });
  } catch (err) {
    console.error('Error in GET /api/users/:userId', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Centralized error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
