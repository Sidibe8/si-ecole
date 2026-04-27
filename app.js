// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connecter MongoDB AVANT de démarrer l'app
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Route de santé
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connecté' : 'déconnecté',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/years', require('./routes/yearRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/periods', require('./routes/periodRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/teacher-payroll', require('./routes/teacherPayroll'));
app.use('/api/admin-payroll', require('./routes/adminPayrollRoutes'));
app.use('/api/absences', require('./routes/absenceRoutes'));
app.use('/api/timetables', require('./routes/timetableRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ 
    message: 'Erreur serveur'
  });
});

module.exports = app;