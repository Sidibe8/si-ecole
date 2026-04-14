// services/mongoService.js
// Helper pour convertir les requêtes MongoDB en format compatible avec les contrôleurs existants

const User = require('../models/mongo/User');
const Student = require('../models/mongo/Student');
const Teacher = require('../models/mongo/Teacher');
const Class = require('../models/mongo/Class');
const Year = require('../models/mongo/Year');
const Enrollment = require('../models/mongo/Enrollment');
const Subject = require('../models/mongo/Subject');
const Period = require('../models/mongo/Period');
const Grade = require('../models/mongo/Grade');
const Absence = require('../models/mongo/Absence');
const Timetable = require('../models/mongo/Timetable');
const PaymentSchedule = require('../models/mongo/PaymentSchedule');
const Payment = require('../models/mongo/Payment');
const TeacherContract = require('../models/mongo/TeacherContract');
const AdminContract = require('../models/mongo/AdminContract');
const PayrollPeriod = require('../models/mongo/PayrollPeriod');
const TeacherPayroll = require('../models/mongo/TeacherPayroll');
const AdminPayroll = require('../models/mongo/AdminPayroll');

// Helper pour transformer _id en id (compatibilité avec l'API existante)
function formatDoc(doc) {
  if (!doc) return null;
  const formatted = doc.toObject ? doc.toObject() : doc;
  return {
    ...formatted,
    id: formatted._id.toString()
  };
}

module.exports = {
  User: {
    async findByEmail(email) {
      const user = await User.findOne({ email });
      return user ? formatDoc(user) : null;
    },
    async findById(id) {
      const user = await User.findById(id);
      return user ? formatDoc(user) : null;
    },
    async findAll() {
      const users = await User.find().sort({ createdAt: -1 });
      return users.map(formatDoc);
    },
    async create(data) {
      const user = new User(data);
      await user.save();
      return formatDoc(user);
    },
    async delete(id) {
      await User.findByIdAndDelete(id);
      return { id };
    },
    async comparePassword(plainPassword, hashedPassword) {
      const bcrypt = require('bcryptjs');
      return bcrypt.compare(plainPassword, hashedPassword);
    }
  },
  
  Student: {
    async findAll() {
      const students = await Student.find().sort({ last_name: 1, first_name: 1 });
      return students.map(formatDoc);
    },
    async findById(id) {
      const student = await Student.findById(id);
      return student ? formatDoc(student) : null;
    },
    async create(data) {
      const student = new Student(data);
      await student.save();
      return formatDoc(student);
    },
    async update(id, data) {
      const student = await Student.findByIdAndUpdate(id, data, { new: true });
      return student ? formatDoc(student) : null;
    },
    async delete(id) {
      await Student.findByIdAndDelete(id);
      return { id };
    }
  },
  
  Teacher: {
    async findAll() {
      const teachers = await Teacher.find().sort({ last_name: 1, first_name: 1 });
      return teachers.map(formatDoc);
    },
    async findById(id) {
      const teacher = await Teacher.findById(id);
      return teacher ? formatDoc(teacher) : null;
    },
    async create(data) {
      const teacher = new Teacher(data);
      await teacher.save();
      return formatDoc(teacher);
    },
    async update(id, data) {
      const teacher = await Teacher.findByIdAndUpdate(id, data, { new: true });
      return teacher ? formatDoc(teacher) : null;
    },
    async delete(id) {
      await Teacher.findByIdAndDelete(id);
      return { id };
    }
  },
  
  Class: {
    async findAll() {
      const classes = await Class.find().sort({ level_order: 1 });
      return classes.map(formatDoc);
    },
    async findById(id) {
      const classItem = await Class.findById(id);
      return classItem ? formatDoc(classItem) : null;
    },
    async create(data) {
      const classItem = new Class(data);
      await classItem.save();
      return formatDoc(classItem);
    },
    async update(id, data) {
      const classItem = await Class.findByIdAndUpdate(id, data, { new: true });
      return classItem ? formatDoc(classItem) : null;
    },
    async delete(id) {
      await Class.findByIdAndDelete(id);
      return { id };
    }
  },
  
  Year: {
    async findAll() {
      const years = await Year.find().sort({ start_date: -1 });
      return years.map(formatDoc);
    },
    async findById(id) {
      const year = await Year.findById(id);
      return year ? formatDoc(year) : null;
    },
    async getCurrent() {
      const year = await Year.findOne({ is_current: true });
      return year ? formatDoc(year) : null;
    },
    async create(data) {
      if (data.is_current) {
        await Year.updateMany({}, { is_current: false });
      }
      const year = new Year(data);
      await year.save();
      return formatDoc(year);
    },
    async update(id, data) {
      if (data.is_current) {
        await Year.updateMany({}, { is_current: false });
      }
      const year = await Year.findByIdAndUpdate(id, data, { new: true });
      return year ? formatDoc(year) : null;
    },
    async delete(id) {
      await Year.findByIdAndDelete(id);
      return { id };
    }
  },

  Enrollment: {
    async findAll() {
      const enrollments = await Enrollment.find()
        .populate('student_id', 'first_name last_name')
        .populate('class_id', 'name')
        .populate('year_id', 'label')
        .sort({ 'year_id.start_date': -1, 'student_id.last_name': 1 });
      
      return enrollments.map(e => ({
        ...formatDoc(e),
        first_name: e.student_id?.first_name,
        last_name: e.student_id?.last_name,
        class_name: e.class_id?.name,
        year_label: e.year_id?.label
      }));
    },
    async findById(id) {
      const enrollment = await Enrollment.findById(id)
        .populate('student_id', 'first_name last_name')
        .populate('class_id', 'name')
        .populate('year_id', 'label');
      
      return enrollment ? {
        ...formatDoc(enrollment),
        first_name: enrollment.student_id?.first_name,
        last_name: enrollment.student_id?.last_name,
        class_name: enrollment.class_id?.name,
        year_label: enrollment.year_id?.label
      } : null;
    },
    async findByStudent(studentId) {
      const enrollments = await Enrollment.find({ student_id: studentId })
        .populate('class_id', 'name')
        .populate('year_id', 'label')
        .sort({ 'year_id.start_date': -1 });
      
      return enrollments.map(e => ({
        ...formatDoc(e),
        class_name: e.class_id?.name,
        year_label: e.year_id?.label
      }));
    },
    async findByClassAndYear(classId, yearId) {
      const enrollments = await Enrollment.find({ class_id: classId, year_id: yearId })
        .populate('student_id', 'first_name last_name')
        .sort({ 'student_id.last_name': 1 });
      
      return enrollments.map(e => ({
        ...formatDoc(e),
        first_name: e.student_id?.first_name,
        last_name: e.student_id?.last_name
      }));
    },
    async create(data) {
      const enrollment = new Enrollment(data);
      await enrollment.save();
      return formatDoc(enrollment);
    },
    async update(id, data) {
      const enrollment = await Enrollment.findByIdAndUpdate(id, data, { new: true });
      return enrollment ? formatDoc(enrollment) : null;
    },
    async delete(id) {
      await Enrollment.findByIdAndDelete(id);
      return { id };
    }
  },

  Subject: {
    async findAll() {
      const subjects = await Subject.find()
        .populate('class_id', 'name')
        .sort({ 'class_id.level_order': 1, name: 1 });
      
      return subjects.map(s => ({
        ...formatDoc(s),
        class_name: s.class_id?.name
      }));
    },
    async findById(id) {
      const subject = await Subject.findById(id)
        .populate('class_id', 'name');
      
      return subject ? {
        ...formatDoc(subject),
        class_name: subject.class_id?.name
      } : null;
    },
    async findByClass(classId) {
      const subjects = await Subject.find({ class_id: classId }).sort({ name: 1 });
      return subjects.map(formatDoc);
    },
    async create(data) {
      const subject = new Subject(data);
      await subject.save();
      return formatDoc(subject);
    },
    async update(id, data) {
      const subject = await Subject.findByIdAndUpdate(id, data, { new: true });
      return subject ? formatDoc(subject) : null;
    },
    async delete(id) {
      await Subject.findByIdAndDelete(id);
      return { id };
    }
  },

  Period: {
    async findAll() {
      const periods = await Period.find()
        .populate('year_id', 'label')
        .sort({ 'year_id.start_date': 1, start_date: 1 });
      
      return periods.map(p => ({
        ...formatDoc(p),
        year_label: p.year_id?.label
      }));
    },
    async findById(id) {
      const period = await Period.findById(id)
        .populate('year_id', 'label');
      
      return period ? {
        ...formatDoc(period),
        year_label: period.year_id?.label
      } : null;
    },
    async findByYear(yearId) {
      const periods = await Period.find({ year_id: yearId }).sort({ start_date: 1 });
      return periods.map(formatDoc);
    },
    async create(data) {
      const period = new Period(data);
      await period.save();
      return formatDoc(period);
    },
    async update(id, data) {
      const period = await Period.findByIdAndUpdate(id, data, { new: true });
      return period ? formatDoc(period) : null;
    },
    async delete(id) {
      await Period.findByIdAndDelete(id);
      return { id };
    }
  },
  
  Grade: {
    async findAll() {
      const grades = await Grade.find()
        .populate('student_id', 'first_name last_name')
        .populate('subject_id', 'name')
        .sort({ id: -1 });
      
      return grades.map(formatDoc);
    },
    async findById(id) {
      const grade = await Grade.findById(id);
      return grade ? formatDoc(grade) : null;
    },
    async findByStudent(studentId) {
      const grades = await Grade.find({ student_id: studentId })
        .sort({ period_id: 1, subject_id: 1 });
      return grades.map(formatDoc);
    },
    async findByClassAndPeriod(classId, periodId) {
      // Besoin de joindre avec Enrollment pour filtrer par classe
      const enrollments = await Enrollment.find({ class_id: classId, status: 'actif' });
      const studentIds = enrollments.map(e => e.student_id);
      
      const grades = await Grade.find({
        student_id: { $in: studentIds },
        period_id: periodId
      })
        .populate('student_id', 'first_name last_name')
        .populate('subject_id', 'name')
        .sort({ 'student_id.last_name': 1, 'student_id.first_name': 1, 'subject_id.name': 1 });
      
      return grades.map(formatDoc);
    },
    async create(data) {
      const grade = new Grade(data);
      await grade.save();
      return formatDoc(grade);
    },
    async update(id, data) {
      const grade = await Grade.findByIdAndUpdate(id, data, { new: true });
      return grade ? formatDoc(grade) : null;
    },
    async delete(id) {
      await Grade.findByIdAndDelete(id);
      return { id };
    }
  },
  
  Absence: {
    async findAll() {
      const absences = await Absence.find()
        .populate({
          path: 'enrollment_id',
          populate: {
            path: 'student_id',
            select: 'first_name last_name'
          }
        })
        .populate({
          path: 'enrollment_id',
          populate: {
            path: 'class_id',
            select: 'name'
          }
        })
        .populate({
          path: 'enrollment_id',
          populate: {
            path: 'year_id',
            select: 'label'
          }
        })
        .sort({ absence_date: -1 });
      
      return absences.map(a => ({
        ...formatDoc(a),
        first_name: a.enrollment_id?.student_id?.first_name,
        last_name: a.enrollment_id?.student_id?.last_name,
        class_name: a.enrollment_id?.class_id?.name,
        year_label: a.enrollment_id?.year_id?.label
      }));
    },
    async findById(id) {
      const absence = await Absence.findById(id);
      return absence ? formatDoc(absence) : null;
    },
    async findByEnrollment(enrollmentId) {
      const absences = await Absence.find({ enrollment_id: enrollmentId })
        .sort({ absence_date: -1 });
      return absences.map(formatDoc);
    },
    async create(data) {
      const absence = new Absence(data);
      await absence.save();
      return formatDoc(absence);
    },
    async update(id, data) {
      const absence = await Absence.findByIdAndUpdate(id, data, { new: true });
      return absence ? formatDoc(absence) : null;
    },
    async delete(id) {
      await Absence.findByIdAndDelete(id);
      return { id };
    }
  },

  PaymentSchedule: {
    async findAll() {
      const schedules = await PaymentSchedule.find()
        .populate('class_id', 'name')
        .populate('year_id', 'label')
        .sort({ due_date: 1 });
      
      return schedules.map(formatDoc);
    },
    async findById(id) {
      const schedule = await PaymentSchedule.findById(id);
      return schedule ? formatDoc(schedule) : null;
    },
    async create(data) {
      const schedule = new PaymentSchedule(data);
      await schedule.save();
      return formatDoc(schedule);
    },
    async update(id, data) {
      const schedule = await PaymentSchedule.findByIdAndUpdate(id, data, { new: true });
      return schedule ? formatDoc(schedule) : null;
    },
    async delete(id) {
      await PaymentSchedule.findByIdAndDelete(id);
      return { id };
    },
    async getOverduePayments() {
      const schedules = await PaymentSchedule.find({
        due_date: { $lt: new Date() }
      });
      
      const overdueResults = [];
      for (const schedule of schedules) {
        const enrollments = await Enrollment.find({
          status: 'actif',
          $or: [
            { class_id: schedule.class_id },
            { year_id: schedule.year_id }
          ]
        }).populate('student_id', 'first_name last_name');
        
        for (const enrollment of enrollments) {
          const payment = await Payment.findOne({
            schedule_id: schedule._id,
            enrollment_id: enrollment._id
          });
          
          if (!payment) {
            overdueResults.push({
              ...formatDoc(schedule),
              first_name: enrollment.student_id?.first_name,
              last_name: enrollment.student_id?.last_name,
              enrollment_id: enrollment._id
            });
          }
        }
      }
      
      return overdueResults;
    }
  },
  
  Payment: {
    async findAll() {
      const payments = await Payment.find()
        .populate({
          path: 'enrollment_id',
          populate: [
            {
              path: 'student_id',
              select: 'first_name last_name'
            },
            {
              path: 'year_id',
              select: 'label'
            }
          ]
        })
        .sort({ payment_date: -1 });
      
      return payments.map(p => ({
        ...formatDoc(p),
        first_name: p.enrollment_id?.student_id?.first_name,
        last_name: p.enrollment_id?.student_id?.last_name,
        year_label: p.enrollment_id?.year_id?.label
      }));
    },
    async findByEnrollment(enrollmentId) {
      const payments = await Payment.find({ enrollment_id: enrollmentId })
        .populate('schedule_id', 'description')
        .sort({ payment_date: -1 });
      
      return payments.map(formatDoc);
    },
    async create(data) {
      const payment = new Payment(data);
      await payment.save();
      return formatDoc(payment);
    },
    async update(id, data) {
      const payment = await Payment.findByIdAndUpdate(id, data, { new: true });
      return payment ? formatDoc(payment) : null;
    },
    async delete(id) {
      await Payment.findByIdAndDelete(id);
      return { id };
    }
  },
  
  // Timetable, Contracts, Payrolls, etc. - même pattern
  Timetable: {
    async findAll() {
      const timetables = await Timetable.find()
        .populate('class_id', 'name')
        .populate('subject_id', 'name')
        .populate('teacher_id', 'first_name last_name')
        .sort({ class_id: 1, day_of_week: 1, start_time: 1 });
      
      return timetables.map(formatDoc);
    },
    async findById(id) {
      const timetable = await Timetable.findById(id);
      return timetable ? formatDoc(timetable) : null;
    },
    async findByClass(classId) {
      const timetables = await Timetable.find({ class_id: classId })
        .populate('subject_id', 'name')
        .populate('teacher_id', 'first_name last_name')
        .sort({ day_of_week: 1, start_time: 1 });
      
      return timetables.map(formatDoc);
    },
    async create(data) {
      const timetable = new Timetable(data);
      await timetable.save();
      return formatDoc(timetable);
    },
    async update(id, data) {
      const timetable = await Timetable.findByIdAndUpdate(id, data, { new: true });
      return timetable ? formatDoc(timetable) : null;
    },
    async delete(id) {
      await Timetable.findByIdAndDelete(id);
      return { id };
    }
  }
};

// Continuer avec les autres modèles...