import { FileManager } from './FileManager'

const { stdout } = process

interface ConfigType {
  editorOptions: {
    // tslint:disable-next-line
    lineNumbers: boolean
  }
}

export class ConfigManager {
  public static configFileName = 'chi.json'
  public static handleParsingFailure() {
    const colorStart = '\x1b[31;49m'
    const colorEnd = '\x1b[39;49m'
    stdout.write(
      `${colorStart}Failed to parse JSON config: ${ConfigManager.configFileName}${colorEnd}\n`,
    )
    process.exit(1)
  }

  private config: ConfigType

  private defaultOptions = {
    editorOptions: {
      lineNumbers: false,
    },
  }

  constructor() {
    const file = FileManager.readOrNull('chi.json')
    if (!file) {
      this.config = this.defaultOptions
    } else {
      try {
        const config = JSON.parse(file.buffer.join(''))
        this.config = config
      } catch (e) {
        this.config = this.defaultOptions
        ConfigManager.handleParsingFailure()
      }
    }
  }

  public getLineNumbers() {
    const {
      editorOptions: { lineNumbers },
    } = this.config
    return lineNumbers
  }
}
