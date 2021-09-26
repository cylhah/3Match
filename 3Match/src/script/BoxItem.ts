import { EventManager } from "./common/EventManager";
import { MCustomEvent } from "./common/MCustomEvent";
import { Store } from "./common/Store";
import { Vector2 } from "./gameData/CommonData";
import { MGameConfig } from "./gameData/Variables";

export default class BoxItem extends Laya.Script {
    private boxId: number;

    /**
     * 初始化
     * @param type 0: GameBoard上方即将下落的box 1: 在GameBoard里的box
     */
    public init(type: number, id: number) {
        this.boxId = id;
        this.switchTexture(id);

        if (type == 0) {
            EventManager.Instance.on(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
            this.posToGameBoardReadyArea();
        }
    }

    private switchTexture(id: number) {
        (<Laya.Sprite>this.owner).loadImage(`image/box/game_box_${id}.png`);
    }

    private posToGameBoardReadyArea() {
        (<Laya.Sprite>this.owner).pos(252, -MGameConfig.GameBoxItemSize.x);
    }

    public posToGameBoard(gameMeshX: number, gameMeshY: number) {
        let offset = this.transMeshXYToOffset(gameMeshX, gameMeshY);
        (<Laya.Sprite>this.owner).pos(offset.x, offset.y);
    }

    onDestroy() {
        EventManager.Instance.off(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
    }

    private transMeshXYToOffset(meshX: number, meshY: number) {
        return new Vector2(MGameConfig.GameMeshStartPosition.x + MGameConfig.GameBoxItemSize.x * meshX, MGameConfig.GameMeshStartPosition.y - MGameConfig.GameBoxItemSize.y * meshY);
    }

    private onGameBoardClick(clickMeshX: number) {
        let sprite = <Laya.Sprite>this.owner;
        let offsetX = clickMeshX * MGameConfig.GameBoxItemSize.x;
        Laya.Tween.to(sprite, { x: offsetX, y: -MGameConfig.GameBoxItemSize.x }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, this.onTweenCompelete, [clickMeshX]));
    }

    private calcDropY(dropX: number) {
        for (let i = 0; i < Store.Instance.GameBoardArray.length; i++) {
            let row = Store.Instance.GameBoardArray[i];
            if (row[dropX] == -1) {
                return i;
            }
        }
    }

    private onTweenCompelete(clickMeshX: number) {
        let sprite = <Laya.Sprite>this.owner;
        let dropY = this.calcDropY(clickMeshX);
        let offset = this.transMeshXYToOffset(clickMeshX, dropY);
        Laya.Tween.to(sprite, { x: offset.x, y: offset.y }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, this.onDropCompelete, [clickMeshX, dropY]));
    }

    private onDropCompelete(meshX: number, meshY: number) {
        Store.Instance.placeBoxItem(meshY, meshX, this.boxId);
        EventManager.Instance.off(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
        EventManager.Instance.event(MCustomEvent.BoxItemDrop, [meshX, meshY]);
    }
}
