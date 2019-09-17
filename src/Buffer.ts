import os from 'os'

import { Utils } from './Utils'

const { stdout } = process

export class Buffer {
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
    return new Buffer(lines.filter(line => line === '' || Boolean(line)))
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
