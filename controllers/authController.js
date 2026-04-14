// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpire } = require('../config/auth');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, role, nom_complet } = req.body;
    
    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ 
        message: 'Email, mot de passe et rôle requis' 
      });
    }

    const validRoles = ['admin', 'comptable', 'secretariat', 'parent'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Rôle invalide. Rôles acceptés: ' + validRoles.join(', ') 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Créer l'utilisateur
    const user = new User({
      email: email.toLowerCase(),
      password,  // Sera hashé automatiquement par le middleware pre-save
      role,
      nom_complet: nom_complet || '',
      bank_account: req.body.bank_account || '',
      bank_name: req.body.bank_name || '',
      tax_id: req.body.tax_id || ''
    });

    await user.save();

    // Retourner l'utilisateur sans le mot de passe
    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: userObject 
    });
    
  } catch (err) {
    console.error('Register error:', err);
    
    // Erreur de validation Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    
    // Erreur de duplication
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email et mot de passe requis' 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Créer le token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Retourner la réponse
    const userObject = user.toObject();
    delete userObject.password;

    res.json({
      token,
      user: userObject
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nom_complet } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nom_complet },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Mot de passe modifié' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyFullProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('student_id')
      .populate('teacher_id');
      
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    let extraData = {};
    
    if (user.role === 'parent' && user.student_id) {
      const enrollments = await Enrollment.find({ 
        student_id: user.student_id._id 
      })
        .populate('class_id', 'name')
        .populate('year_id', 'label')
        .sort({ 'year_id.start_date': -1 });
        
      extraData.student = {
        ...user.student_id.toObject(),
        enrollments
      };
    } else if (['admin', 'comptable', 'secretariat'].includes(user.role)) {
      const currentContract = await AdminContract.findOne({ 
        user_id: user._id,
        status: 'actif'
      }).populate('year_id', 'label');
      
      extraData.currentContract = currentContract;
    }
    
    res.json({ user, ...extraData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};