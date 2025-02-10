const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Template = require('../models/Template');
const Thumbnail = require('../models/Thumbnail');
require('dotenv').config();

const templates = [
  {
    name: "Gaming Thumbnail",
    category: "Gaming",
    thumbnail: "https://your-s3-bucket.s3.region.amazonaws.com/thumbnails/gaming-template.jpg",
    imageUrl: "https://your-s3-bucket.s3.region.amazonaws.com/thumbnails/gaming-template.jpg",
    imageKey: "thumbnails/gaming-template.jpg",
    canvasSize: { width: 1280, height: 720 },
    background: {
      type: "image",
      url: "https://your-s3-bucket.s3.region.amazonaws.com/backgrounds/gaming-bg.png"
    },
    elements: [
      {
        type: "image",
        url: "https://your-s3-bucket.s3.region.amazonaws.com/elements/character.png",
        position: { x: 300, y: 150 },
        size: { width: 400, height: 400 },
        opacity: 1,
        rotation: 0
      },
      {
        type: "text",
        content: "Epic Win!",
        position: { x: 500, y: 100 },
        style: {
          fontFamily: "Impact",
          fontSize: 64,
          color: "#FFD700",
          bold: true,
          shadow: { color: "#000000", blur: 5, offsetX: 3, offsetY: 3 }
        }
      }
    ],
    isPublic: true
  },
  {
    name: "Tech Review",
    category: "Technology",
    thumbnail: "https://your-s3-bucket.s3.region.amazonaws.com/thumbnails/tech-template.jpg",
    imageUrl: "https://your-s3-bucket.s3.region.amazonaws.com/thumbnails/tech-template.jpg",
    imageKey: "thumbnails/tech-template.jpg",
    canvasSize: { width: 1280, height: 720 },
    background: {
      type: "gradient",
      colors: ["#2C3E50", "#3498DB"]
    },
    elements: [
      {
        type: "image",
        url: "https://your-s3-bucket.s3.region.amazonaws.com/elements/device.png",
        position: { x: 200, y: 200 },
        size: { width: 500, height: 300 },
        opacity: 1,
        rotation: -15
      },
      {
        type: "text",
        content: "BEST TECH 2024",
        position: { x: 650, y: 150 },
        style: {
          fontFamily: "Arial",
          fontSize: 72,
          color: "#FFFFFF",
          bold: true,
          shadow: { color: "#000000", blur: 3, offsetX: 2, offsetY: 2 }
        }
      }
    ],
    isPublic: true
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