export class Utils {
    /**
     * 生成[min. max)的随机整数，不包括max
     * @param min 最小值
     * @param max 最大值
     * @returns 生成随机数
     */
  public static random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
