#!/usr/bin/env node

import { Editor } from './Editor'
import { FileManager } from './FileManager'

const filename = process.argv[2]
if (!filename) {
  FileManager.missingArg()
} else {
  const editor = new Editor(filename)
  editor.run()
}
