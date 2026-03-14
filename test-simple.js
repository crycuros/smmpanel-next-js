require('dotenv').config()
const mysql = require('mysql2')

console.log('Testing connection to:', process.env.DATABASE_URL)

const conn = mysql.createConnection(process.env.DATABASE_URL)

conn.connect((err) => {
  if (err) {
    console.log('❌ Connection FAILED')
    console.log('Error code:', err.code)
    console.log('Error message:', err.message)
  } else {
    console.log('✅ Connected successfully!')
    conn.end()
  }
  process.exit(0)
})

// Force exit after 10 seconds
setTimeout(() => {
  console.log('Timeout - forcing exit')
  process.exit(1)
}, 10000)
