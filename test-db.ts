import mysql from 'mysql2/promise'
import 'dotenv/config'

async function testConnection() {
  let connection
  
  try {
    console.log('Testing database connection to xo.india.ke...')
    console.log('Database:', process.env.DATABASE_URL)
    
    connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
    })
    
    console.log('✅ Connected to MySQL!')
    
    // Check if users table exists
    const [tables] = await connection.query('SHOW TABLES')
    console.log('Tables in database:', tables)
    
    // Try to get users
    const [users] = await connection.query('SELECT * FROM users LIMIT 5')
    console.log('Users:', users)
    
  } catch (error: any) {
    console.error('❌ Connection failed:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

testConnection()
