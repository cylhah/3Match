import { EventManager } from "./common/EventManager";
import { MCustomEvent } from "./common/MCustomEvent";
import { Store } from "./common/Store";
import { Vector2 } from "./gameData/CommonData";
import { MGameConfig } from "./gameData/Variables";

export default class BoxItem extends Laya.Script {
    public boxId: number;
    private meshX: number;
    private meshY: number;

    public init(id: number) {
        this.boxId = id;
        this.switchTexture(id);
    }

    private switchTexture(id: number) {
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

    onAwake() {
        EventManager.Instance.on(MCustomEvent.CorrectCurrentBox, this, this.onCorrectCurrentBox);
    }

    onDestroy() {
        EventManager.Instance.off(MCustomEvent.CorrectCurrentBox, this, this.onCorrectCurrentBox);
    }

    private onCorrectCurrentBox() {
        console.log("onCorrectCurrentBox", Store.Instance.GameBoardArray, this.meshX, this.meshY);
    }

    public destroyBoxItem() {
        this.owner.destroy();
    }

    private transMeshXYToOffset(meshX: number, meshY: number) {
        return new Vector2(MGameConfig.GameMeshStartPosition.x + MGameConfig.GameBoxItemSize.x * meshX, MGameConfig.GameMeshStartPosition.y - MGameConfig.GameBoxItemSize.y * meshY);
    }
}
