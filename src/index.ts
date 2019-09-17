#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { Editor } from './Editor'

const { stdout } = process

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
