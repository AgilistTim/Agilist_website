#!/usr/bin/env node
import bcrypt from 'bcryptjs'
import { createInterface } from 'node:readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })

rl.question('Enter the admin password to hash: ', async (password) => {
  rl.close()

  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters.')
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)
  console.log('\n--- Copy this value into your ADMIN_PASSWORD_HASH env var ---')
  console.log(hash)
  console.log('---')
})
