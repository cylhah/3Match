import { MGameConfig } from "../gameData/Variables";

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

    public init() {
        Store.Instance.GameBoardArray = [];
        for (let i = 0; i < MGameConfig.GameMeshHeight; i++) {
            for (let j = 0; j < MGameConfig.GameMeshWidth; j++) {
                if (!Store.Instance.GameBoardArray[i]) {
                  Store.Instance.GameBoardArray[i] = [];
                }
                Store.Instance.GameBoardArray[i][j] = -1;
            }
        }
    }

    public placeBoxItem(x: number, y: number, id: number) {
        this.GameBoardArray[x][y] = id;
    }
}
