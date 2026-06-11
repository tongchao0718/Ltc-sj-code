/**
 * 将目录打成 zip（Windows: Compress-Archive / Unix: zip -r）
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export function zipDirectory(sourceDir, zipPath) {
  const absSource = path.resolve(sourceDir)
  const absZip = path.resolve(zipPath)

  if (!fs.existsSync(absSource)) {
    throw new Error(`压缩源目录不存在: ${absSource}`)
  }

  fs.mkdirSync(path.dirname(absZip), { recursive: true })
  if (fs.existsSync(absZip)) fs.rmSync(absZip, { force: true })

  if (process.platform === 'win32') {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${absSource.replace(/'/g, "''")}' -DestinationPath '${absZip.replace(/'/g, "''")}' -Force"`,
      { stdio: 'inherit' }
    )
  } else {
    const parent = path.dirname(absSource)
    const base = path.basename(absSource)
    execSync(`cd "${parent}" && zip -r "${absZip}" "${base}"`, { stdio: 'inherit' })
  }

  if (!fs.existsSync(absZip)) {
    throw new Error(`压缩失败，未生成: ${absZip}`)
  }

  return absZip
}
