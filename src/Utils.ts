export class Utils {
  public static clamp(value: number, min: number, max: number) {
    if (value < min) {
      return min
    }
    if (value > max) {
      return max
    }
    return value
  }

  public static insertAt(value: string, index: number, char: string) {
    return (
      value.substring(0, index) + char + value.substring(index, value.length)
    )
  }

  public static deleteAt(value: string, index: number) {
    return value.slice(0, index) + value.slice(index + 1)
  }
}
