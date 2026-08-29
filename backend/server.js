const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

app.use(helmet());
// Wide open by default so the frontend can reach it from any hosting
// domain while you're setting things up. Once your Netlify URL is final,
// you can lock this down with: cors({ origin: 'https://your-site.netlify.app' })
app.use(cors());
app.use(express.json());

// Simple health check — visiting the API's root URL in a browser should show this
app.get('/', (req, res) => {
  res.json({ message: 'Daybook API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start accepting requests once the database is actually connected,
// so the server never appears "up" while it has nowhere to save data.
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
