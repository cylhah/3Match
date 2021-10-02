import BoxItem from "../BoxItem";
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

    public GameBoardArray: BoxItem[][];

    public init() {
        this.GameBoardArray = Utils.fill2DAry(MGameConfig.GameMeshHeight, MGameConfig.GameMeshWidth, null);
    }

    public placeBoxItem(meshX: number, meshY: number, item: BoxItem) {
        this.GameBoardArray[meshY][meshX] = item;
    }

    public getBoxItemId(meshX: number, meshY: number) {
        if (meshY < 0 || meshY >= MGameConfig.GameMeshHeight || meshX < 0 || meshX >= MGameConfig.GameMeshWidth) return null;
        let item = this.GameBoardArray[meshY][meshX];
        return item ? item.boxId : null;
    }

    public calcDropY(dropX: number) {
        for (let i = 0; i < this.GameBoardArray.length; i++) {
            let row = this.GameBoardArray[i];
            if (row[dropX] == null) {
                return i;
            }
        }
    }
}
