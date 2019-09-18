const { stdout } = process

export class ANSI {
  static clearScreen() {
    stdout.write('\x1b[2J')
  }
  static moveCursor(row: number, col: number) {
    stdout.write(`\x1b[${row + 1};${col + 1}H`)
  }
}
