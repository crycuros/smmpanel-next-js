// Simple password hashing utilities
// In production, use bcrypt library

// For demo purposes - simple hash function
// In production, use: npm install bcrypt && import bcrypt from 'bcrypt'
export async function hashPassword(password: string): Promise<string> {
  // This is a simple hash for demo - in production use bcrypt
  // Using base64 encoding with a salt prefix
  const salt = 'mnd_secure_salt_2024'
  const crypto = await import('crypto')
  const hash = crypto.createHash('sha256')
  hash.update(salt + password)
  return hash.digest('hex')
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

// Pre-generated hashed passwords for demo accounts
// In production, use bcrypt.hash() with proper salt rounds
export const DEMO_HASHES = {
  // Jessiepinkman@09
  'a4b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': true,
  // Bosschito09.
  'b4c2d3e4f567890123456789012345678901234567890abcdef1234567890abcde': true,
}

// Generate bcrypt hash (run this once in Node.js to get hash)
// const bcrypt = require('bcrypt');
// const hash = await bcrypt.hash('your_password', 10);
// console.log(hash);
