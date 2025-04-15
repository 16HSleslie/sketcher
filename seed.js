const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');

// Import models
const Product = require('./app/models/Product');
const User = require('./app/models/User');
const Admin = require('./app/models/Admin');
const Order = require('./app/models/Order');

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected for Seeding'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Sample Products
const products = [
  {
    name: 'Leather Notebook',
    description: 'Handcrafted leather-bound notebook with premium paper',
    price: 35.99,
    images: ['leather-notebook.jpg'],
    category: 'Notebooks',
    stock: 25,
    isAvailable: true
  },
  {
    name: 'Custom Journal',
    description: 'Customizable journal with your choice of cover material',
    price: 45.99,
    images: ['custom-journal.jpg'],
    category: 'Journals',
    stock: 15,
    isAvailable: true
  },
  {
    name: 'Vintage Book Restoration',
    description: 'Professional restoration service for vintage books',
    price: 150.00,
    images: ['vintage-restoration.jpg'],
    category: 'Services',
    stock: 999,
    isAvailable: true
  },
  {
    name: 'Sketchbook',
    description: 'Premium sketchbook with acid-free drawing paper',
    price: 28.50,
    images: ['sketchbook.jpg'],
    category: 'Sketchbooks',
    stock: 40,
    isAvailable: true
  },
  {
    name: 'Bookbinding Kit',
    description: 'Complete bookbinding kit with tools and materials',
    price: 75.00,
    images: ['bookbinding-kit.jpg'],
    category: 'Supplies',
    stock: 10,
    isAvailable: true
  }
];

// Sample Users
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  }
];

// Sample Admin
const admins = [
  {
    username: 'admin',
    email: 'admin@bookbindery.com',
    password: 'admin123'
  }
];

// Seed Database
async function seedDatabase() {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Order.deleteMany({});
    
    console.log('Database cleared');

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products inserted`);
    
    // Hash passwords and insert users
    const hashedUsers = await Promise.all(users.map(async user => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      return user;
    }));
    
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users inserted`);
    
    // Hash password and insert admin
    const adminWithHashedPassword = await Promise.all(admins.map(async admin => {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);
      return admin;
    }));
    
    const createdAdmins = await Admin.insertMany(adminWithHashedPassword);
    console.log(`${createdAdmins.length} admins inserted`);
    
    // Create sample orders
    const sampleOrders = [
      {
        customer: {
          name: createdUsers[0].name,
          email: createdUsers[0].email,
          phone: '555-123-4567',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'USA'
          }
        },
        items: [
          {
            product: createdProducts[0]._id,
            quantity: 2,
            price: createdProducts[0].price
          },
          {
            product: createdProducts[1]._id,
            quantity: 1,
            price: createdProducts[1].price
          }
        ],
        total: createdProducts[0].price * 2 + createdProducts[1].price,
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        status: 'delivered'
      },
      {
        customer: {
          name: createdUsers[1].name,
          email: createdUsers[1].email,
          phone: '555-987-6543',
          address: {
            street: '456 Oak Ave',
            city: 'Other City',
            state: 'NY',
            zipCode: '67890',
            country: 'USA'
          }
        },
        items: [
          {
            product: createdProducts[2]._id,
            quantity: 1,
            price: createdProducts[2].price
          }
        ],
        isCustomOrder: true,
        customOrderDetails: {
          specifications: 'Leather-bound with gold lettering',
          requiredMaterials: 'Genuine leather, acid-free paper',
          estimatedCompletionTime: '2 weeks',
          additionalNotes: 'Please contact before starting the project'
        },
        total: createdProducts[2].price,
        paymentMethod: 'paypal',
        paymentStatus: 'pending',
        status: 'processing'
      }
    ];
    
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`${createdOrders.length} orders inserted`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 