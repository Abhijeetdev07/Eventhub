require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { connectDb } = require('./config/db');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
