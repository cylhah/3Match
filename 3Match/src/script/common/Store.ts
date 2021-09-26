import { MGameConfig } from "../gameData/Variables";
import { Utils } from "./Utils";

export class Store {
    private static instance: Store;
    private constructor() {}
    public static get Instance() {
        if (!this.instance) {
            this.instance = new Store();
        }
        return this.instance;
    }

    public GameBoardArray: number[][];

    public init() {
        Store.instance.GameBoardArray = Utils.fill2DAry(MGameConfig.GameMeshHeight, MGameConfig.GameMeshWidth, -1);
    }

    public placeBoxItem(x: number, y: number, id: number) {
        this.GameBoardArray[x][y] = id;
    }

    public getBoxItemId(meshX: number, meshY: number) {
        if (meshY < 0 || meshY >= MGameConfig.GameMeshHeight || meshX < 0 || meshX >= MGameConfig.GameMeshWidth) return null;

        return Store.instance.GameBoardArray[meshY][meshX];
    }
}
