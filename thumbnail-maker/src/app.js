const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUI = require('swagger-ui-express');
const swaggerConfig = require('./config/swagger');
const { handleError } = require('./utils/errorHandler');
const { cache } = require('./middleware/cache');
const healthRoutes = require('./routes/healthRoutes');
const http = require('http');
const SocketService = require('./services/socketService');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const thumbnailRoutes = require('./routes/thumbnailRoutes');
const stickerRoutes = require('./routes/stickerRoutes');

dotenv.config();

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Apply cache only if Redis is configured
if (process.env.REDIS_HOST) {
  app.use('/api/templates', cache(3600), templateRoutes);
  app.use('/api/thumbnails', cache(1800), thumbnailRoutes);
} else {
  app.use('/api/templates', templateRoutes);
  app.use('/api/thumbnails', thumbnailRoutes);
}

app.use('/api/stickers', stickerRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerConfig));

// Health check routes
app.use('/api', healthRoutes);

// Error handling middleware
app.use(handleError);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // Close server
  server.close(() => {
    // Close database connection
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

// Export the Express app for Vercel
module.exports = app;