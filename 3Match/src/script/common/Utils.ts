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

    public static fill2DAry(l1: number, l2: number, value: any) {
        let ary = [];
        for (let i = 0; i < l1; i++) {
            for (let j = 0; j < l2; j++) {
                if (!ary[i]) {
                    ary[i] = [];
                }
                ary[i][j] = value;
            }
        }
        return ary;
    }
}
