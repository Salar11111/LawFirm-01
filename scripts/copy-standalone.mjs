import { access, cp } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const standalone = path.join(root, '.next', 'standalone')
await access(standalone)
await cp(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), { recursive: true })
await cp(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true })
