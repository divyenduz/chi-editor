import os from 'os'
const { stdout } = process

export class ANSI {
  public static clearScreen() {
    stdout.write('\x1b[2J')
  }
  public static moveCursor(row: number, col: number) {
    stdout.write(`\x1b[${row + 1};${col + 1}H`)
  }
  public static red(s: string, cr: boolean = true) {
    const colorStart = '\x1b[31;49m'
    return `${colorStart}${s}${ANSI.colorEnd}${cr ? os.EOL : ''}`
  }
  public static green(s: string, cr: boolean = true) {
    const colorStart = '\x1b[33;49m'
    return `${colorStart}${s}${ANSI.colorEnd}${cr ? os.EOL : ''}`
  }
  public static purple(s: string, cr: boolean = true) {
    const colorStart = '\x1b[35;49m'
    return `${colorStart}${s}${ANSI.colorEnd}${cr ? os.EOL : ''}`
  }
  private static colorEnd = '\x1b[39;49m'
}
