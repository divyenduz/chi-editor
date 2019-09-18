#!/usr/bin/env node

import { ConfigManager } from './ConfigManager'
import { Editor } from './Editor'
import { FileManager } from './FileManager'

const filename = process.argv[2]
if (!filename) {
  FileManager.missingArg()
} else {
  const configManager = new ConfigManager()

  const editor = new Editor(filename, configManager)
  editor.run()
}
