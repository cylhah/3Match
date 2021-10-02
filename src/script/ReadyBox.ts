import BoxItem from "./BoxItem";
import { EventManager } from "./common/EventManager";
import { MCustomEvent } from "./common/MCustomEvent";
import { Store } from "./common/Store";
import { Vector2 } from "./gameData/CommonData";
import { MGameConfig } from "./gameData/Variables";

export default class ReadyBox extends Laya.Script {
    onAwake() {
        EventManager.Instance.on(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
    }

    onDestroy() {
        EventManager.Instance.off(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
        EventManager.Instance.event(MCustomEvent.CreateNewReadyBox);
    }

    private onGameBoardClick(clickMeshX: number) {
        if (this.checkGameEnd(clickMeshX)) {
            EventManager.Instance.event(MCustomEvent.GameEnd);
            return;
        }

        let sprite = <Laya.Sprite>this.owner;
        let offsetX = clickMeshX * MGameConfig.GameBoxItemSize.x;
        Laya.Tween.to(sprite, { x: offsetX, y: -MGameConfig.GameBoxItemSize.x }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, this.onTweenCompelete, [clickMeshX]));
    }

    private checkGameEnd(clickMeshX: number) {
        let dropY = Store.Instance.calcDropY(clickMeshX);
        return dropY == null;
    }

    private onTweenCompelete(clickMeshX: number) {
        let sprite = <Laya.Sprite>this.owner;
        let dropY = Store.Instance.calcDropY(clickMeshX);
        let offset = this.transMeshXYToOffset(clickMeshX, dropY);
        Laya.Tween.to(sprite, { x: offset.x, y: offset.y }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, this.onDropCompelete, [clickMeshX, dropY]));
    }

    private transMeshXYToOffset(meshX: number, meshY: number) {
        return new Vector2(MGameConfig.GameMeshStartPosition.x + MGameConfig.GameBoxItemSize.x * meshX, MGameConfig.GameMeshStartPosition.y - MGameConfig.GameBoxItemSize.y * meshY);
    }

    private onDropCompelete(meshX: number, meshY: number) {
        let boxItemScript: BoxItem = this.owner.getComponent(BoxItem);
        Store.Instance.placeBoxItem(meshX, meshY, boxItemScript);
        boxItemScript.updateSelfXYData(meshX, meshY);
        EventManager.Instance.event(MCustomEvent.BoxItemDrop, [meshX, meshY]);
        this.destroy();
    }

    public posToGameBoardReadyArea() {
        (<Laya.Sprite>this.owner).pos(252, -MGameConfig.GameBoxItemSize.x);
    }
}
