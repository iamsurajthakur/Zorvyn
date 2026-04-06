import mongoose from 'mongoose'
import { User } from './src/models/user.model.js'
import { FinancialRecord } from './src/models/record.model.js'
import env from './src/config/env.js'

const users = [
  {
    name: 'Suraj Admin',
    email: 'admin@zorvyn.com',
    password: 'Admin123',
    role: 'ADMIN',
  },
  {
    name: 'Rahul Analyst',
    email: 'analyst@zorvyn.com',
    password: 'Analyst123',
    role: 'ANALYST',
  },
  {
    name: 'Krish Viewer',
    email: 'viewer@zorvyn.com',
    password: 'Viewer123',
    role: 'VIEWER',
  },
]

const generateRecords = (adminId) => [
  //January 2026
  {
    amount: 50000 * 100,
    type: 'INCOME',
    category: 'salary',
    date: new Date('2026-01-01'),
    description: 'January salary',
    createdBy: adminId,
  },
  {
    amount: 15000 * 100,
    type: 'EXPENSE',
    category: 'rent',
    date: new Date('2026-01-05'),
    description: 'January rent payment',
    createdBy: adminId,
  },
  {
    amount: 3000 * 100,
    type: 'EXPENSE',
    category: 'food',
    date: new Date('2026-01-10'),
    description: 'Monthly groceries',
    createdBy: adminId,
  },
  {
    amount: 1500 * 100,
    type: 'EXPENSE',
    category: 'utilities',
    date: new Date('2026-01-15'),
    description: 'Electricity and water bill',
    createdBy: adminId,
  },
  {
    amount: 8000 * 100,
    type: 'INCOME',
    category: 'freelance',
    date: new Date('2026-01-20'),
    description: 'Freelance web project',
    createdBy: adminId,
  },

  //February 2026
  {
    amount: 50000 * 100,
    type: 'INCOME',
    category: 'salary',
    date: new Date('2026-02-01'),
    description: 'February salary',
    createdBy: adminId,
  },
  {
    amount: 15000 * 100,
    type: 'EXPENSE',
    category: 'rent',
    date: new Date('2026-02-05'),
    description: 'February rent payment',
    createdBy: adminId,
  },
  {
    amount: 2500 * 100,
    type: 'EXPENSE',
    category: 'food',
    date: new Date('2026-02-10'),
    description: 'Groceries and dining',
    createdBy: adminId,
  },
  {
    amount: 5000 * 100,
    type: 'INCOME',
    category: 'investment',
    date: new Date('2026-02-15'),
    description: 'Mutual fund returns',
    createdBy: adminId,
  },
  {
    amount: 2000 * 100,
    type: 'EXPENSE',
    category: 'transport',
    date: new Date('2026-02-20'),
    description: 'Monthly commute expenses',
    createdBy: adminId,
  },

  //March 2026
  {
    amount: 50000 * 100,
    type: 'INCOME',
    category: 'salary',
    date: new Date('2026-03-01'),
    description: 'March salary',
    createdBy: adminId,
  },
  {
    amount: 15000 * 100,
    type: 'EXPENSE',
    category: 'rent',
    date: new Date('2026-03-05'),
    description: 'March rent payment',
    createdBy: adminId,
  },
  {
    amount: 10000 * 100,
    type: 'INCOME',
    category: 'freelance',
    date: new Date('2026-03-10'),
    description: 'Mobile app development project',
    createdBy: adminId,
  },
  {
    amount: 3500 * 100,
    type: 'EXPENSE',
    category: 'healthcare',
    date: new Date('2026-03-15'),
    description: 'Annual health checkup',
    createdBy: adminId,
  },
  {
    amount: 4000 * 100,
    type: 'EXPENSE',
    category: 'education',
    date: new Date('2026-03-20'),
    description: 'Online course subscription',
    createdBy: adminId,
  },

  //April 2026
  {
    amount: 50000 * 100,
    type: 'INCOME',
    category: 'salary',
    date: new Date('2026-04-01'),
    description: 'April salary',
    createdBy: adminId,
  },
  {
    amount: 15000 * 100,
    type: 'EXPENSE',
    category: 'rent',
    date: new Date('2026-04-05'),
    description: 'April rent payment',
    createdBy: adminId,
  },
  {
    amount: 8000 * 100,
    type: 'EXPENSE',
    category: 'entertainment',
    date: new Date('2026-04-10'),
    description: 'Weekend trip expenses',
    createdBy: adminId,
  },
  {
    amount: 12000 * 100,
    type: 'INCOME',
    category: 'business',
    date: new Date('2026-04-15'),
    description: 'Consulting fees',
    createdBy: adminId,
  },
  {
    amount: 6000 * 100,
    type: 'EXPENSE',
    category: 'shopping',
    date: new Date('2026-04-20'),
    description: 'Clothing and accessories',
    createdBy: adminId,
  },
]

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI)
    console.log('Connected to MongoDB')

    await User.deleteMany({})
    await FinancialRecord.deleteMany({})
    console.log('Cleared existing data')

    const createdUsers = []
    for (const userData of users) {
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash: userData.password,
        role: userData.role,
        isActive: true,
      })
      createdUsers.push(user)
      console.log(`Created ${userData.role}: ${userData.email}`)
    }

    const admin = createdUsers.find((u) => u.role === 'ADMIN')

    const records = generateRecords(admin._id)
    await FinancialRecord.insertMany(records)
    console.log(`Created ${records.length} financial records`)

    // 6. Summary
    console.log('\------------------------------------')
    console.log('Seed completed successfully')
    console.log('-------------------------------------')
    console.log('\n Test Credentials:')
    console.log('--------------------------------------')
    console.log('ADMIN    → admin@zorvyn.com    / Admin123')
    console.log('ANALYST  → analyst@zorvyn.com  / Analyst123')
    console.log('VIEWER   → viewer@zorvyn.com   / Viewer123')
    console.log('---------------------------------------\n')

  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

seed()