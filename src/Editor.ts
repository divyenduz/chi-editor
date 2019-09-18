import fs from 'fs'
import os from 'os'
import path from 'path'

import { ANSI } from './ANSI'
import { Buffer } from './Buffer'
import { Cursor } from './Cursor'
import { Utils } from './Utils'

const { stdin } = process

interface HistoryItem {
  buffer: Buffer
  cursor: Cursor
}

export class Editor {
  filename: string
  filepath: string
  buffer: Buffer
  cursor: Cursor
  history: HistoryItem[]

  constructor(filename: string) {
    this.filename = filename
    this.filepath = path.join(process.cwd(), this.filename)

    const lines = fs
      .readFileSync(this.filepath, {
        encoding: 'utf8'
      })
      .split(os.EOL)

    this.buffer = new Buffer(lines)
    this.cursor = new Cursor()
    this.history = []
  }

  run() {
    if (stdin.isTTY) {
      stdin.setRawMode!(true)
    }
    stdin.resume()
    stdin.setEncoding('utf8')
    this.render() // Initial paint
    stdin.on('data', chunk => {
      this.handleInput(chunk)
      this.render()
    })
  }

  render() {
    ANSI.clearScreen()
    ANSI.moveCursor(0, 0)
    this.buffer.render()
    ANSI.moveCursor(this.cursor.row, this.cursor.col)
  }

  handleInput(char: string) {
    const handled = this.handleSpecialChar(char)
    if (handled) {
      return
    }

    switch (char) {
      case '\u0011': // C-q
      case '\u0003': // C-c
        ANSI.clearScreen()
        process.exit(0)
        break
      case '\u0010':
      case '\u001b[A': // C-p or up
        this.cursor = this.cursor.up(this.buffer)
        break
      case '\u000e':
      case '\u001b[B': // C-n or down
        this.cursor = this.cursor.down(this.buffer)
        break
      case '\u0002':
      case '\u001b[D': // C-b or left
        this.cursor = this.cursor.left(this.buffer)
        break
      case '\u0006':
      case '\u001b[C': // C-f or right
        this.cursor = this.cursor.right(this.buffer)
        break
      case '\r': // Return
        this.saveSnapshot()
        this.buffer = this.buffer.splitLine(this.cursor.row, this.cursor.col)
        this.cursor = this.cursor.down(this.buffer).moveToCol(0)
        break
      case '\u001b[1~': // Home key
      case '\u001b[H':
        this.cursor = this.cursor.moveToCol(0)
        break
      case '\u001b[4~': // End key
      case '\u001b[F':
        this.cursor = this.cursor.moveToCol(
          this.buffer.lineLength(this.cursor.row)
        )
        break
      case '\u0015': // C-u
        this.restoreSnapshot()
        break
      case '\u001b': // Esc
      case '\u001b[2~': // Insert
        break
      case '\u0013': // C-s
        const content = this.buffer.getAsString()
        this.saveFile(content)
        break
      case '\u001b[3~': // Delete
        this.saveSnapshot()
        if (this.cursor.col < this.buffer.lineLength(this.cursor.row)) {
          this.buffer = this.buffer.deleteForward(
            this.cursor.row,
            this.cursor.col
          )
        }
        break
      default:
        // TODO: Function keys pending amongst other keys

        this.saveSnapshot()
        this.buffer = this.buffer.insert(char, this.cursor.row, this.cursor.col)
        this.cursor = this.cursor.right(this.buffer)
        break
    }
  }

  handleSpecialChar(char: string) {
    const code = char.charCodeAt(0)
    if (code === 127) {
      return this.handleBackspace(char)
    }
    return false
  }

  handleBackspace(char: string) {
    // Backspace it returns and invisible ' ' but with length 1 but not space
    // Its character code is 127 though
    if (char.charCodeAt(0) === 127) {
      if (this.cursor.col > 0) {
        this.saveSnapshot()
        this.buffer = this.buffer.delete(this.cursor.row, this.cursor.col - 1)
        this.cursor = this.cursor.left(this.buffer)
        return true
      } else if (this.cursor.row === 0 && this.cursor.col === 0) {
        return true
      } else if (this.cursor.row > 0 && this.cursor.col === 0) {
        this.saveSnapshot()
        const prevLineLength = this.buffer.lineLength(this.cursor.row - 1)
        this.buffer = this.buffer.mergeLines(this.cursor.row)
        this.cursor = this.cursor.up(this.buffer).moveToCol(prevLineLength)
        return true
      } else {
        this.cursor = this.cursor
          .up(this.buffer)
          .moveToCol(
            this.buffer.lineLength(
              Utils.clamp(this.cursor.row - 1, 0, this.buffer.lineCount())
            )
          )
        return true
      }
    } else {
      return false
    }
  }

  saveSnapshot() {
    this.history = this.history.concat({
      buffer: this.buffer,
      cursor: this.cursor
    })
  }

  restoreSnapshot() {
    if (this.history.length > 0) {
      const historyItem = this.history.slice().pop()
      this.history = this.history.slice(0, this.history.length - 1)
      if (historyItem) {
        const { buffer, cursor } = historyItem
        this.buffer = buffer
        this.cursor = cursor
      }
    }
  }

  saveFile(content: string) {
    fs.writeFileSync(this.filepath, content)
  }
}
