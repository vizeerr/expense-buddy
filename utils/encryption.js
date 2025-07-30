// utils/encryption.js (server-side only)
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPT_SECRET // Must be 32 bytes
const IV = process.env.ENCRYPT_IV // Must be 16 bytes

export function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), IV)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString('hex')
}

export function decrypt(text) {
  const encryptedText = Buffer.from(text, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), IV)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
