// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS - Accepter tout
app.use(cors());  // <=Ça accepte toutes les origines

// Ou si vous voulez être plus explicite :
// app.use(cors({
//   origin: '*',
//   methods: '*',
//   allowedHeaders: '*'
// }));

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Import des routes
const authRoutes = require('./routes/authRoutes');
const yearRoutes = require('./routes/yearRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const periodRoutes = require('./routes/periodRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const teacherPayrollRoutes = require('./routes/teacherPayroll');
const adminPayrollRoutes = require('./routes/adminPayrollRoutes');
const absenceRoutes = require('./routes/absenceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

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

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher-payroll', teacherPayrollRoutes);
app.use('/api/admin-payroll', adminPayrollRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/timetables', timetableRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ 
    message: 'Erreur serveur', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

module.exports = app;