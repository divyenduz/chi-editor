#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import os from 'os'

const { stdin, stdout } = process

interface HistoryItem {
  buffer: Buffer
  cursor: Cursor
}

class Editor {
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
    stdin.setRawMode(true)
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
    switch (char) {
      case '\u0011': // C-q // TODO: Check what encoding to use to get this to work like "C-q" from $stdin.getc in ruby
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
        this.cursor = this.cursor.moveToCol(0)
        break
      case '\u001b[4~': // End key
        this.cursor = this.cursor.moveToCol(
          this.buffer.lineLength(this.cursor.row)
        )
        break
      case '\u0015': // C-u
        this.restoreSnapshot()
        break
      case '\u001b': // Esc
        break
      case '\u0013': // C-s
        const content = this.buffer.getAsString()
        this.saveFile(content)
        break
      default:
        if (char.charCodeAt(0) === 127) {
          if (this.cursor.col > 0) {
            // TODO: Backspace it returns '' but with length 1 otherwise, which is a mystery
            this.saveSnapshot()
            this.buffer = this.buffer.delete(
              this.cursor.row,
              this.cursor.col - 1
            )
          } else if (this.cursor.row === 0 && this.cursor.col === 0) {
            break
          } else if (this.cursor.row > 0 && this.cursor.col === 0) {
            this.saveSnapshot()
            const prevLineLength = this.buffer.lineLength(this.cursor.row - 1)
            this.buffer = this.buffer.mergeLines(
              this.cursor.row,
              this.cursor.col
            )
            this.cursor = this.cursor.up(this.buffer).moveToCol(prevLineLength)
            break
          } else {
            this.cursor = this.cursor
              .up(this.buffer)
              .moveToCol(
                this.buffer.lineLength(
                  Utils.clamp(this.cursor.row - 1, 0, this.buffer.lineCount())
                )
              )
          }
          this.cursor = this.cursor.left(this.buffer)
          break
        }
        this.saveSnapshot()
        this.buffer = this.buffer.insert(char, this.cursor.row, this.cursor.col)
        this.cursor = this.cursor.right(this.buffer)
        break
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
      const { buffer, cursor } = this.history.pop() // TODO: Make immutable
      this.buffer = buffer
      this.cursor = cursor
    }
  }

  saveFile(content) {
    fs.writeFileSync(this.filepath, content)
  }
}

class Buffer {
  lines: string[]
  constructor(lines: string[]) {
    this.lines = lines
  }

  render() {
    stdout.write(this.getAsString())
  }

  insert(char: string, row: number, col: number): Buffer {
    let lines = this.lines.map(line => line)
    lines[row] = Utils.insertAt(lines[row], col, char)
    return new Buffer(lines)
  }

  delete(row: number, col: any): Buffer {
    let lines = this.lines.map(line => line)
    lines[row] = Utils.deleteAt(lines[row], col)
    return new Buffer(lines)
  }

  splitLine(row: number, col: number): Buffer {
    let lines = this.lines.map(line => line)
    const splitLines = [lines[row].slice(0, col), lines[row].slice(col)]
    const finalLines = [
      ...lines.slice(0, row),
      ...splitLines,
      ...lines.slice(row + 1)
    ]
    return new Buffer(finalLines)
  }

  mergeLines(row: number, col: number): Buffer {
    let lines = this.lines.map(line => line)
    lines[row - 1] = lines[row - 1] + lines[row]
    delete lines[row] // TODO: Make immutable
    return new Buffer(lines.filter(line => Boolean(line)))
  }

  lineCount() {
    return this.lines.length
  }

  lineLength(row: number) {
    return this.lines[row].length
  }

  getAsString() {
    return this.lines.join(os.EOL)
  }
}

class Cursor {
  row: number
  col: number
  constructor(row = 0, col = 0) {
    this.row = row
    this.col = col
  }

  up(buffer: Buffer) {
    return new Cursor(this.row - 1, this.col).clamp(buffer)
  }

  down(buffer: Buffer) {
    return new Cursor(this.row + 1, this.col).clamp(buffer)
  }

  left(buffer: Buffer) {
    return new Cursor(this.row, this.col - 1).clamp(buffer)
  }

  right(buffer: Buffer) {
    return new Cursor(this.row, this.col + 1).clamp(buffer)
  }

  moveToCol(col: number) {
    if (col < 0) {
      return new Cursor(this.row, 0)
    }
    return new Cursor(this.row, col)
  }

  clamp(buffer: Buffer) {
    const row = Utils.clamp(this.row, 0, buffer.lineCount() - 1)
    const col = Utils.clamp(this.col, 0, buffer.lineLength(row))
    return new Cursor(row, col)
  }
}

class ANSI {
  static clearScreen() {
    stdout.write('\x1b[2J') // TODO: Check how this relates to "^[[" as the escape sequence
  }
  static moveCursor(row, col) {
    stdout.write(`\x1b[${row + 1};${col + 1}H`)
  }
}

class Utils {
  static clamp(value, min, max) {
    if (value < min) {
      return min
    }
    if (value > max) {
      return max
    }
    return value
  }

  static insertAt(value: string, index: number, char: string) {
    return (
      value.substring(0, index) + char + value.substring(index, value.length)
    )
  }

  static deleteAt(value: string, index: number) {
    return value.slice(0, index) + value.slice(index + 1)
  }
}

const filename = process.argv[2]
if (!filename) {
  const colorStart = '\x1b[31;49m'
  const colorEnd = '\x1b[39;49m'
  stdout.write(`${colorStart}Please provide a file name${colorEnd}`)
  process.exit(1)
}

const filepath = path.join(process.cwd(), filename)
const exists = fs.existsSync(filepath)
if (!exists) {
  fs.writeFileSync(filepath, '')
}

const editor = new Editor(filename)
editor.run()
