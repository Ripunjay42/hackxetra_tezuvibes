const prisma = require("../db/index");
const db = require('../db/connection');

// Register a new user
exports.registerUser = async (req, res) => {
  const { email, username, firstName, lastName, phoneNumber, gender, bio, profilePicURL } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        phoneNumber,
        gender,
        bio,
        profilePicURL,
        emailVerified: false,
        isEmailVerified: false,
      },
    });

    // Set the cookie with `userId`
    res.cookie('userId', user.id);
    res.status(201).json({ message: 'User registered', userId: user.id });

  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Check if a user exists by email and return user ID if true
exports.checkUserExists = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      res.status(200).json({ exists: true, userId: user.id });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to check user existence' });
  }
};


// Get all user ids and usernames
exports.getAllUserIds = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,  // Changed from firstName to username
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user IDs' });
  }
};


exports.getAllUserInfo = async (req, res) => {
  const { userId } = req.params; // Corrected to req.params
  console.log(userId); // Log userId for debugging

  db.any('SELECT id, "email", "firstName", "lastName", "phoneNumber", bio, username FROM "User" WHERE id = $1', [userId])
    .then((data) => {
      res.json({ users: data });
    })
    .catch((error) => {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Failed to fetch user information' });
    });
};