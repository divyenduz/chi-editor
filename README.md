# Introduction

CLI editor made for fun

Install:

```sh
npm install -g chi-editor
chi <file-name>
```

# Features

| Hotkey         | Description                            |
| -------------- | -------------------------------------- |
| `C-q` or `C-c` | Quit the editor                        |
| `C-s`          | Save the buffer to file                |
| Return         | Split lines                            |
| Backspace      | Delete previous character, merge lines |
| Delete         | Delete current character               |
| `C-p` or up    | Move cursor to previous row            |
| `C-n` or down  | Move cursor to next row                |
| `C-b` or back  | Move cursor to forward                 |
| `C-f` or right | Move cursor to backward                |
| Esc            | Ignore                                 |
| `C-u`          | Undo                                   |
| Home           | Move cursor to start of line           |
| End            | Move cursor to end of line             |

# Development

Run `yarn xd` to open the sample file. Tail `debug.log` and write to `stderr` for development debugging.

# Contribute

Please feel free to suggest issues and chime in
