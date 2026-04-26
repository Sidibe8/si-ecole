const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares globaux
app.use(cors());
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
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

module.exports = app;