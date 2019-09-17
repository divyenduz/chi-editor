const { stdout } = process

export class ANSI {
  static clearScreen() {
    stdout.write('\x1b[2J') // TODO: Check how this relates to "^[[" as the escape sequence
  }
  static moveCursor(row: number, col: number) {
    stdout.write(`\x1b[${row + 1};${col + 1}H`)
  }
}
