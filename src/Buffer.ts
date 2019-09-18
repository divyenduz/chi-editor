import os from 'os'

import { Utils } from './Utils'

const { stdout } = process

export class Buffer {
  private lines: string[]
  constructor(lines: string[]) {
    this.lines = lines
  }

  public render() {
    stdout.write(this.getAsString())
  }

  public insert(char: string, row: number, col: number): Buffer {
    const lines = this.lines.map(line => line)
    lines[row] = Utils.insertAt(lines[row], col, char)
    return new Buffer(lines)
  }

  public delete(row: number, col: any): Buffer {
    const lines = this.lines.map(line => line)
    lines[row] = Utils.deleteAt(lines[row], col)
    return new Buffer(lines)
  }

  public deleteForward(row: number, col: any): Buffer {
    const lines = this.lines.map(line => line)
    lines[row] = Utils.deleteAt(lines[row], col)
    return new Buffer(lines)
  }

  public splitLine(row: number, col: number): Buffer {
    const lines = this.lines.map(line => line)
    const splitLines = [lines[row].slice(0, col), lines[row].slice(col)]
    const finalLines = [
      ...lines.slice(0, row),
      ...splitLines,
      ...lines.slice(row + 1),
    ]
    return new Buffer(finalLines)
  }

  public mergeLines(row: number): Buffer {
    const lines: string[] = this.lines
      .map((line, index) => {
        if (index === row - 1) {
          return this.lines[row - 1] + this.lines[row]
        }
        return line
      })
      .filter((_, index) => index !== row)
    return new Buffer(lines)
  }

  public lineCount() {
    return this.lines.length
  }

  public lineLength(row: number) {
    return this.lines[row].length
  }

  public getAsString() {
    return this.lines.join(os.EOL)
  }
}
