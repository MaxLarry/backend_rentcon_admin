const express = require('express');
const connectDB = require('./db');
const dotenv = require('dotenv');
const Agenda = require('agenda');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const listingPropertyRoutes = require('./routes/propertyListingRoutes');
const UserRoutes = require('./routes/userRoutes');
const ActivityLogRoutes = require('./routes/activityLogsRoutes');
const DataOverviewRoutes = require('./routes/dataOverviewRoutes');
//const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));


const mongoConnectionString = process.env.MONGO_URI;
const agenda = new Agenda({ db: { address: mongoConnectionString } });
const { calculateMonthlyRates, saveMonthlyRates } = require('./services/DataOverview.services');

// Define a job that runs monthly
agenda.define('update monthly rates', async (job) => {
  try {
    const monthlyRates = await calculateMonthlyRates();
    await saveMonthlyRates(monthlyRates);
    console.log('Monthly rates updated successfully.');
  } catch (error) {
    console.error('Error updating monthly rates:', error);
  }
});

// Schedule the job to run at the end of each month
agenda.on('ready', async () => {
  await agenda.every('0 0 1 * *', 'update monthly rates');
  agenda.start();
});

// Routes
app.use('/auth', authRoutes);
app.use('/requests', listingPropertyRoutes);
app.use('/user', UserRoutes);
app.use('/logs', ActivityLogRoutes);
app.use('/data', DataOverviewRoutes)

const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not defined
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.get('/', (req, res) =>{
  res.send('Hello, World!')
})





/*const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');

const app = express();
app.use(cors());
connectDB();

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});
*/
// User login

/*
 // Import the database connection function
const Admin = require('./models/User'); // Import the Admin model

app.use(express.json());

// Connect to the database




// Example route to get all admins
app.get('/admins', async (req, res) => {
    try {
      const admins = await Admin.find({});
      console.log('Admins found:', admins);
      
      res.send(admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).send({ error: 'Error fetching admins' });
    }
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/*
app.get('/hello', (req, res) =>{
    res.send('Hello, World!')
})

app.listen(5000, () => {
    console.log('Server running on port 5000')
})*/