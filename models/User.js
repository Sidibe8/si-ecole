// models/User.js (version alternative avec next)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'comptable', 'secretariat', 'parent'], 
    required: true 
  },
  nom_complet: String,
  student_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  },
  teacher_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher' 
  },
  bank_account: String,
  bank_name: String,
  tax_id: String
}, { 
  timestamps: true 
});

// Utiliser une fonction normale (pas arrow function) pour avoir accès à 'this'
userSchema.pre('save', function(next) {
  // Seulement hasher si le mot de passe est modifié
  if (!this.isModified('password')) {
    return next();
  }
  
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);