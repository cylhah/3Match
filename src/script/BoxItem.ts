import { Store } from "./common/Store";
import { Vector2 } from "./gameData/CommonData";
import { MGameConfig } from "./gameData/Variables";

export default class BoxItem extends Laya.Script {
    public boxId: number;
    private meshX: number = -1;
    private meshY: number = -1;

    public init(id: number) {
        this.boxId = id;
        this.switchTargetImage(id);
    }

    private switchTargetImage(id: number) {
        (<Laya.Sprite>this.owner).loadImage(`image/box/game_box_${id}.png`);
    }

    public updateSelfXYData(gameMeshX: number, gameMeshY: number) {
        this.meshX = gameMeshX;
        this.meshY = gameMeshY;
    }

    public posToGameBoard(gameMeshX: number, gameMeshY: number) {
        let offset = this.transMeshXYToOffset(gameMeshX, gameMeshY);
        (<Laya.Sprite>this.owner).pos(offset.x, offset.y);
        this.updateSelfXYData(gameMeshX, gameMeshY);
    }

    public currectBox() {
        let downStep = 0;
        for (let i = this.meshY - 1; i >= 0; i--) {
            let downItem = Store.Instance.GameBoardArray[i][this.meshX];
            if (!downItem) {
                downStep++;
            }
        }

        if (downStep > 0) {
            let newY = this.meshY - downStep;
            let item = Store.Instance.GameBoardArray[this.meshY][this.meshX];
            if (item == this) {
                Store.Instance.placeBoxItem(this.meshX, this.meshY, null);
            }
            this.posToGameBoard(this.meshX, newY);
            Store.Instance.placeBoxItem(this.meshX, this.meshY, this);

            return this;
        } else {
            return null;
        }
    }

    public destroyBoxItem() {
        this.owner.destroy();
    }

    private transMeshXYToOffset(meshX: number, meshY: number) {
        return new Vector2(MGameConfig.GameMeshStartPosition.x + MGameConfig.GameBoxItemSize.x * meshX, MGameConfig.GameMeshStartPosition.y - MGameConfig.GameBoxItemSize.y * meshY);
    }
}
