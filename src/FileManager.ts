import fs from 'fs'
import os from 'os'
import path from 'path'
import { ANSI } from './ANSI'

const { stdout } = process

interface FileLike {
  filename: string
  filepath: string
  buffer: string[]
}

export class FileManager {
  public static missingArg() {
    stdout.write(ANSI.red('Please provide a file name'))
    process.exit(1)
  }

  public static save(filename: string, content: string) {
    const filepath = FileManager.getFilePath(filename)
    fs.writeFileSync(filepath, content)
  }

  public static readOrNull(filename: string): FileLike | null {
    const filepath = FileManager.getFilePath(filename)

    const exists = FileManager.exists(filepath)
    if (!exists) {
      return null
    }

    const buffer = FileManager.read(filepath)
    return {
      buffer,
      filename,
      filepath,
    }
  }

  public static readOrCreate(filename: string): FileLike {
    const filepath = FileManager.getFilePath(filename)

    const exists = FileManager.exists(filepath)
    if (!exists) {
      fs.writeFileSync(filepath, '')
    }

    const buffer = FileManager.read(filepath)
    return {
      buffer,
      filename,
      filepath,
    }
  }

  private static exists(filepath: string) {
    return fs.existsSync(filepath)
  }

  private static read(filepath: string) {
    return fs
      .readFileSync(filepath, {
        encoding: 'utf-8',
      })
      .split(os.EOL)
  }

  private static getFilePath(filename: string) {
    return path.join(process.cwd(), filename)
  }
}
