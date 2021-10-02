import ClickBox from "../script/ClickBox";
import BoxItem from "../script/BoxItem";
import { MGameConfig } from "./gameData/Variables";
import { Utils } from "./common/Utils";
import { EventManager } from "./common/EventManager";
import { MCustomEvent } from "./common/MCustomEvent";
import { Store } from "./common/Store";
import ReadyBox from "./ReadyBox";

export default class MainGame extends Laya.Script {
    /** @prop {name:GameBoxItem,tips:"游戏方块",type:Prefab}*/
    public GameBoxItem: Laya.Prefab;
    /** @prop {name:ClickBox,type:Prefab}*/
    public ClickBox: Laya.Prefab;

    private gameBoard: Laya.Sprite;
    private clickContainer: Laya.Sprite;

    onAwake() {
        this.gameBoard = <Laya.Sprite>this.owner.getChildByName("GameBackground").getChildByName("GameBoard");
        this.clickContainer = <Laya.Sprite>this.owner.getChildByName("GameBackground").getChildByName("ClickContainer");

        this.initEventListener();
        Store.Instance.init();
        this.initGameBoard();
        this.initClickBoxes();
    }

    onDestroy() {
        this.removeEventListener();
    }

    private initEventListener() {
        EventManager.Instance.on(MCustomEvent.GameEnd, this, this.onGameEnd);
        EventManager.Instance.on(MCustomEvent.CreateNewReadyBox, this, this.createReadyBox);
        EventManager.Instance.on(MCustomEvent.BoxItemDrop, this, this.onBoxItemDrop);
    }

    private removeEventListener() {
        EventManager.Instance.off(MCustomEvent.GameEnd, this, this.onGameEnd);
        EventManager.Instance.off(MCustomEvent.CreateNewReadyBox, this, this.createReadyBox);
        EventManager.Instance.off(MCustomEvent.BoxItemDrop, this, this.onBoxItemDrop);
    }

    private onGameEnd() {
        console.log("onGameEnd");
    }

    private onBoxItemDrop(meshX: number, meshY: number) {
        this.handleMatch(meshX, meshY);
    }

    private calcMatchedItemAry(meshX: number, meshY: number) {
        let targetId = Store.Instance.getBoxItemId(meshX, meshY);
        let GameWidth = MGameConfig.GameMeshWidth;
        let GameHeight = MGameConfig.GameMeshHeight;
        let queue = [];
        let visit = Utils.fill2DAry(GameHeight, GameWidth, 0);
        let front = 0;
        let rear = 0;
        let current = { x: meshX, y: meshY };
        queue[rear++] = current;
        let matchedItemAry = [];
        let dx = [-1, 1, 0, 0];
        let dy = [0, 0, -1, 1];
        visit[meshY][meshX] = 1;
        while (rear != front) {
            current = queue[front++];
            matchedItemAry.push(current);
            for (let i = 0; i < dx.length; i++) {
                let x = current.x + dx[i];
                let y = current.y + dy[i];
                let nextId = Store.Instance.getBoxItemId(x, y);
                if (x >= 0 && x < GameWidth && y >= 0 && y < GameHeight && nextId == targetId && visit[y][x] == 0) {
                    visit[y][x] = 1;
                    queue[rear++] = { x, y };
                }
            }
        }

        return matchedItemAry;
    }

    private handleMatch(meshX: number, meshY: number) {
        let targetId = Store.Instance.getBoxItemId(meshX, meshY);
        if (targetId == null) return;
        let matchedItemAry = this.calcMatchedItemAry(meshX, meshY);

        if (matchedItemAry.length >= 3) {
            for (let i = 0; i < matchedItemAry.length; i++) {
                let x = matchedItemAry[i].x;
                let y = matchedItemAry[i].y;
                let item = Store.Instance.GameBoardArray[y][x];
                item.destroyBoxItem();
                Store.Instance.placeBoxItem(x, y, null);
            }

            this.currectCurrentGameBoard();
        }
    }

    private currectCurrentGameBoard() {
        let needHandItemAry = [];
        for (let i = 0; i < Store.Instance.GameBoardArray.length; i++) {
            for (let j = 0; j < Store.Instance.GameBoardArray[i].length; j++) {
                let item = Store.Instance.GameBoardArray[i][j];
                if (item) {
                    let res = item.currectBox();
                    if (res) {
                        needHandItemAry.push(res);
                    }
                }
            }
        }

        for (let i = 0; i < needHandItemAry.length; i++) {
            let item = needHandItemAry[i];
            EventManager.Instance.event(MCustomEvent.BoxItemDrop, [item.meshX, item.meshY]);
        }
    }

    private createReadyBox() {
        let readyBox: Laya.Sprite = this.GameBoxItem.create();
        let boxItem: BoxItem = readyBox.getComponent(BoxItem);
        boxItem.init(this.getRandomItemId());
        let readyBoxScript: ReadyBox = readyBox.addComponent(ReadyBox);
        readyBoxScript.posToGameBoardReadyArea();
        this.gameBoard.addChild(readyBox);
    }

    private getRandomItemId() {
        return Utils.random(1, 10);
    }

    private initGameBoard() {
        let InitialGameCount = MGameConfig.InitialGameMeshHeight * MGameConfig.GameMeshWidth;
        for (let i = 0; i < InitialGameCount; i++) {
            let gameMeshX = i % MGameConfig.GameMeshWidth;
            let gameMeshY = Math.floor(i / MGameConfig.GameMeshWidth);

            let box: Laya.Sprite = this.GameBoxItem.create();
            let scirpt: BoxItem = box.getComponent(BoxItem);
            let itemId = this.getRandomItemId();
            scirpt.init(itemId);
            scirpt.posToGameBoard(gameMeshX, gameMeshY);
            this.gameBoard.addChild(box);
            Store.Instance.GameBoardArray[gameMeshY][gameMeshX] = scirpt;
        }

        this.createReadyBox();
    }

    private initClickBoxes() {
        for (let i = 0; i < MGameConfig.GameMeshWidth; i++) {
            let clickBox: Laya.Sprite = this.ClickBox.create();

            let script: ClickBox = clickBox.getComponent(ClickBox);
            script.init(i);
            this.clickContainer.addChild(clickBox);
        }
    }
}
