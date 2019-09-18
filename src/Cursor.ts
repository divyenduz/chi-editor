import { Buffer } from './Buffer'
import { Utils } from './Utils'

export class Cursor {
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
