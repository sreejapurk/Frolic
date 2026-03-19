import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      studio TEXT NOT NULL,
      category TEXT NOT NULL,
      price DECIMAL NOT NULL,
      level TEXT NOT NULL,
      duration TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      spots INTEGER NOT NULL,
      spots_left INTEGER NOT NULL,
      distance TEXT,
      rating TEXT DEFAULT '4.9',
      image TEXT,
      instructor TEXT,
      room TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id TEXT UNIQUE NOT NULL,
      class_id UUID REFERENCES classes(id),
      class_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      amount DECIMAL NOT NULL,
      stripe_payment_id TEXT,
      payment_status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      studio_name TEXT NOT NULL,
      email TEXT NOT NULL,
      instagram TEXT,
      phone TEXT,
      status TEXT DEFAULT 'applied',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS studio_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      studio_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      approved BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      data TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

