export class Store {
    private static instance: Store;
    private constructor() {}
    public static get Instance() {
        if (!this.instance) {
            this.instance = new Store();
        }
        return this.instance;
    }

    public GameBoardArray: Array<Array<number>>;
}
