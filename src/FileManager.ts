import fs from 'fs'
import os from 'os'
import path from 'path'

const { stdout } = process

export class FileManager {
  public static missingArg() {
    const colorStart = '\x1b[31;49m'
    const colorEnd = '\x1b[39;49m'
    stdout.write(`${colorStart}Please provide a file name${colorEnd}\n`)
    process.exit(1)
  }

  public static save(filename: string, content: string) {
    const filepath = FileManager.getFilePath(filename)
    fs.writeFileSync(filepath, content)
  }

  public static readOrCreate(filename: string) {
    const filepath = FileManager.getFilePath(filename)

    const exists = fs.existsSync(filepath)
    if (!exists) {
      fs.writeFileSync(filepath, '')
    }

    const contents = fs
      .readFileSync(filepath, {
        encoding: 'utf-8',
      })
      .split(os.EOL)
    return {
      contents,
      filename,
      filepath,
    }
  }

  private static getFilePath(filename: string) {
    return path.join(process.cwd(), filename)
  }
}
