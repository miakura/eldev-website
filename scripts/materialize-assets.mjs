import { mkdir, readFile, writeFile, access, readdir } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const storeRoot = join(root, 'asset-blobs')

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function listB64Files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listB64Files(full)))
    } else if (entry.name.endsWith('.b64')) {
      files.push(full)
    }
  }
  return files
}

async function main() {
  if (!(await exists(storeRoot))) {
    console.log('asset-blobs/ missing — skip materialize')
    return
  }

  const blobs = await listB64Files(storeRoot)
  let written = 0
  for (const blobPath of blobs) {
    const rel = relative(storeRoot, blobPath).replace(/\.b64$/, '')
    const outPath = join(root, rel)
    const b64 = (await readFile(blobPath, 'utf8')).trim()
    const buf = Buffer.from(b64, 'base64')
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, buf)
    written += 1
  }
  console.log(`materialized ${written} assets`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
