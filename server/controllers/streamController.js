// backend/controllers/streamController.js
const { StreamChat } = require('stream-chat');

const STREAM_API_KEY = '9dtth3yj2vy5';
const STREAM_SECRET = 't7w5zgwdbmvvumjw2a4ch3v7fjxt855auuthqpbrjz8882m8p3hwk787wrmamz95'; // Replace with your actual secret

exports.generateToken = async (req, res) => {
    const { userId, username } = req.body;
  
    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }
  
    try {
      const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_SECRET);
      const token = serverClient.createToken(userId);
  
      res.status(200).json({ 
        token,
        apiKey: STREAM_API_KEY
      });
    } catch (error) {
      console.error('Error generating token:', error);
      res.status(500).json({ error: 'Error generating token' });
    }
  };