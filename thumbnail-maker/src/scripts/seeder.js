const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Template = require('../models/Template');
const Thumbnail = require('../models/Thumbnail');
require('dotenv').config();

const templates = [
    {
      name: 'Minimalist Design',
      category: 'Minimalist',
      elements: [
        {
          type: 'text',
          content: 'Simple & Clean',
          position: { x: 50, y: 50 },
          font: 'sans-serif',
          size: 28,
          color: '#000000',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Less is more.',
          position: { x: 50, y: 150 },
          font: 'sans-serif',
          size: 18,
          color: '#555555',
          fontStyle: 'normal',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      name: 'Modern Business',
      category: 'Business',
      elements: [
        {
          type: 'text',
          content: 'Innovate Your Business',
          position: { x: 50, y: 50 },
          font: 'sans-serif',
          size: 30,
          color: '#FFFFFF',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Grow with us.',
          position: { x: 50, y: 150 },
          font: 'sans-serif',
          size: 20,
          color: '#CCCCCC',
          fontStyle: 'normal',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80',
    },
    {
      name: 'Nature Inspired',
      category: 'Nature',
      elements: [
        {
          type: 'text',
          content: 'Explore the Wild',
          position: { x: 50, y: 50 },
          font: 'serif',
          size: 32,
          color: '#FFFFFF',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Feel the beauty of nature.',
          position: { x: 50, y: 150 },
          font: 'serif',
          size: 20,
          color: '#DDDDDD',
          fontStyle: 'italic',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      name: 'Retro Vibes',
      category: 'Retro',
      elements: [
        {
          type: 'text',
          content: 'Back to the 80s',
          position: { x: 50, y: 50 },
          font: 'monospace',
          size: 34,
          color: '#FF00FF',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Neon lights and disco nights.',
          position: { x: 50, y: 150 },
          font: 'monospace',
          size: 20,
          color: '#00FFFF',
          fontStyle: 'normal',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd880?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      name: 'Elegant Wedding',
      category: 'Wedding',
      elements: [
        {
          type: 'text',
          content: 'Happily Ever After',
          position: { x: 50, y: 50 },
          font: 'serif',
          size: 36,
          color: '#FFFFFF',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Celebrate love.',
          position: { x: 50, y: 150 },
          font: 'serif',
          size: 24,
          color: '#FFD700',
          fontStyle: 'italic',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      name: 'Tech Futuristic',
      category: 'Technology',
      elements: [
        {
          type: 'text',
          content: 'Future is Here',
          position: { x: 50, y: 50 },
          font: 'sans-serif',
          size: 32,
          color: '#00FF00',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Embrace innovation.',
          position: { x: 50, y: 150 },
          font: 'sans-serif',
          size: 20,
          color: '#FFFFFF',
          fontStyle: 'normal',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      name: 'Travel Adventure',
      category: 'Travel',
      elements: [
        {
          type: 'text',
          content: 'Wanderlust',
          position: { x: 50, y: 50 },
          font: 'sans-serif',
          size: 40,
          color: '#FFFFFF',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Explore the world.',
          position: { x: 50, y: 150 },
          font: 'sans-serif',
          size: 24,
          color: '#FFD700',
          fontStyle: 'normal',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
    },
    {
      name: 'Vintage Aesthetic',
      category: 'Vintage',
      elements: [
        {
          type: 'text',
          content: 'Timeless Beauty',
          position: { x: 50, y: 50 },
          font: 'serif',
          size: 36,
          color: '#8B4513',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Classic and elegant.',
          position: { x: 50, y: 150 },
          font: 'serif',
          size: 24,
          color: '#654321',
          fontStyle: 'italic',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      name: 'Fitness Motivation',
      category: 'Fitness',
      elements: [
        {
          type: 'text',
          content: 'Push Your Limits',
          position: { x: 50, y: 50 },
          font: 'sans-serif',
          size: 34,
          color: '#FFFFFF',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Be stronger every day.',
          position: { x: 50, y: 150 },
          font: 'sans-serif',
          size: 22,
          color: '#FF4500',
          fontStyle: 'normal',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      name: 'Artistic Expression',
      category: 'Art',
      elements: [
        {
          type: 'text',
          content: 'Create & Inspire',
          position: { x: 50, y: 50 },
          font: 'cursive',
          size: 38,
          color: '#000000',
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        },
        {
          type: 'text',
          content: 'Unleash your creativity.',
          position: { x: 50, y: 150 },
          font: 'cursive',
          size: 24,
          color: '#555555',
          fontStyle: 'normal',
          alignment: 'center',
          zIndex: 1,
        }
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    }
];

const users = [
  {
    name: "Demo User",
    email: "deepak@example.com",
    password: "deepak@123",
    role: "user",
    isActive: true
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    isActive: true
  }
];

const thumbnails = [
  {
    title: "My Gaming Video",
    description: "Epic gaming moments compilation",
    baseTemplate: null, // Will be set after template creation
    imageUrl: "https://your-s3-bucket.s3.region.amazonaws.com/thumbnails/gaming-thumb-1.jpg",
    textLayers: [
      {
        content: "EPIC WINS!",
        position: { x: 500, y: 100 },
        style: {
          fontFamily: "Impact",
          fontSize: 64,
          color: "#FFD700"
        }
      }
    ],
    creator: null // Will be set after user creation
  }
];

async function seedDatabase() {
  let connection;
  try {
    // Connect to MongoDB
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Template.deleteMany({});
    await Thumbnail.deleteMany({});
    console.log('Cleared existing data');

    // Create users with better logging
    const createdUsers = await Promise.all(
      users.map(async user => {
        const hashedPassword = await bcrypt.hash(user.password, 10); // Increased rounds for security
        const newUser = await User.create({
          ...user,
          password: hashedPassword,
          lastLogin: new Date(),
          loginAttempts: 0
        });
        console.log(`Created user: ${user.email} with role: ${user.role}`);
        return newUser;
      })
    );

    // Verify users were created correctly
    const verifyUsers = await User.find({}, '-password');
    console.log('Verified created users:', verifyUsers.map(u => ({
      email: u.email,
      role: u.role,
      isActive: u.isActive
    })));

    // Create templates
    const createdTemplates = await Promise.all(
      templates.map(template => 
        Template.create({
          ...template,
          creator: createdUsers[0]._id
        })
      )
    );
    console.log('Created templates');

    // Create thumbnails
    const createdThumbnails = await Promise.all(
      thumbnails.map(thumbnail =>
        Thumbnail.create({
          ...thumbnail,
          creator: createdUsers[0]._id,
          baseTemplate: createdTemplates[0]._id
        })
      )
    );
    console.log('Created thumbnails');

    console.log('Database seeded successfully!');
    console.log('Demo User Email:', users[0].email);
    console.log('Demo User Password:', users[0].password);

    await connection.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Seeding error:', error.message);
    if (error.code === 11000) {
      console.error('Duplicate key error - users might already exist');
    }
    process.exit(1);
  }
}

// Run seeder
seedDatabase(); 