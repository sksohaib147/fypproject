const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

console.log('Starting seed script...');

const products = [
  {
    name: 'Premium Dog Food',
    slug: 'premium-dog-food',
    pricePKR: 2999,
    originalPricePKR: 3999,
    description: 'High-quality dog food with balanced nutrition for all breeds',
    category: 'Dogs',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80'],
    location: 'Karachi',
    condition: 'New',
    status: 'available'
  },
  {
    name: 'Cat Scratching Post',
    slug: 'cat-scratching-post',
    pricePKR: 3999,
    originalPricePKR: 4999,
    description: 'Durable cat scratching post with multiple levels and sisal rope',
    category: 'Toys',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80'],
    location: 'Lahore',
    condition: 'New',
    status: 'available'
  },
  {
    name: 'Pet Carrier',
    slug: 'pet-carrier',
    pricePKR: 4999,
    description: 'Comfortable and secure pet carrier for travel with ventilation',
    category: 'Belts and Cages',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'],
    location: 'Islamabad',
    condition: 'New',
    status: 'available'
  },
  {
    name: 'Premium Cat Food',
    slug: 'premium-cat-food',
    pricePKR: 2499,
    originalPricePKR: 3499,
    description: 'High-quality cat food with balanced nutrition for all ages',
    category: 'Cats',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'],
    location: 'Karachi',
    condition: 'New',
    status: 'available'
  },
  {
    name: 'Rabbit Food Mix',
    slug: 'rabbit-food-mix',
    pricePKR: 1999,
    description: 'Nutritious rabbit food mix with hay and pellets',
    category: 'Rabbit Food',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80'],
    location: 'Lahore',
    condition: 'New',
    status: 'available'
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pet-marketplace', {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    console.log('Connected to MongoDB successfully');

    // Create system admin user if it doesn't exist
    let systemUser = await User.findOne({ email: 'admin@system.local' });
    if (!systemUser) {
      systemUser = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@system.local',
        password: 'adminpass123',
        phone: '0000000000',
        role: 'admin'
      });
      console.log('System admin user created');
    }

    console.log('Deleting existing products...');
    await Product.deleteMany({});
    console.log('Existing products deleted');

    console.log('Inserting new products...');
    // Add system user as seller for all products
    const productsWithSeller = products.map(product => ({
      ...product,
      seller: systemUser._id
    }));
    
    const result = await Product.insertMany(productsWithSeller);
    console.log('Products inserted successfully:', result.length);

    console.log('Seeded products successfully!');
  } catch (error) {
    console.error('Error in seed script:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed(); 