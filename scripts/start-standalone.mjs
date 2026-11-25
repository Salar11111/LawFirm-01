import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const standalone = path.join(root, '.next', 'standalone')
const server = path.join(standalone, 'server.js')
const packagedDb = path.join(standalone, 'db', 'custom.db')

// Relative SQLite URLs are resolved from the generated Prisma client inside
// `.next/standalone`, not from `prisma/`, so they break in production. Point
// them at the database copied into the standalone bundle, using an absolute
// file: URL that Prisma resolves the same way in every environment.
const configured = process.env.DATABASE_URL
if (!configured || configured.startsWith('file:')) {
  const configuredPath = configured?.slice('file:'.length) ?? ''
  const isAbsolute = path.isAbsolute(configuredPath) || /^[A-Za-z]:[\\/]/.test(configuredPath)
  if (!isAbsolute && existsSync(packagedDb)) {
    process.env.DATABASE_URL = `file:${packagedDb.replace(/\\/g, '/')}`
    console.log(`Using packaged database: ${process.env.DATABASE_URL}`)
  }
}

const child = spawn(process.execPath, [server], {
  cwd: standalone,
  env: process.env,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 0)
})
child.on('error', (error) => {
  console.error('Failed to start standalone server:', error)
  process.exit(1)
})
