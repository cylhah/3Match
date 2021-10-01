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
        EventManager.Instance.on(MCustomEvent.BoxItemDrop, this, this.onBoxItemDrop);
    }

    private removeEventListener() {
        EventManager.Instance.off(MCustomEvent.BoxItemDrop, this, this.onBoxItemDrop);
    }

    private onBoxItemDrop(meshX: number, meshY: number) {
        this.createReadyBox();
        this.handleMatch(meshX, meshY);
    }

    private handleMatch(meshX: number, meshY: number) {
        let GameWidth = MGameConfig.GameMeshWidth;
        let GameHeight = MGameConfig.GameMeshHeight;

        let queue = [];
        let visit = Utils.fill2DAry(GameHeight, GameWidth, 0);
        let front = 0;
        let rear = 0;
        let current = { x: meshX, y: meshY };
        let targetId = Store.Instance.getBoxItemId(meshX, meshY);
        queue[rear++] = current;
        let matchedItemAry = [];
        let dx = [-1, 1, 0, 0];
        let dy = [0, 0, -1, 1];

        visit[meshX][meshY] = 1;
        while (rear != front) {
            current = queue[front++];
            matchedItemAry.push(current);
            for (let i = 0; i < dx.length; i++) {
                let x = current.x + dx[i];
                let y = current.y + dy[i];
                let nextId = Store.Instance.getBoxItemId(x, y);
                if (x >= 0 && x < GameHeight && y >= 0 && y < GameWidth && nextId == targetId && visit[x][y] == 0) {
                    visit[x][y] = 1;
                    queue[rear++] = { x, y };
                }
            }
        }

        if (matchedItemAry.length >= 3) {
            for (let i = 0; i < matchedItemAry.length; i++) {
                let x = matchedItemAry[i].x;
                let y = matchedItemAry[i].y;
                let item = Store.Instance.GameBoardArray[y][x];
                item.destroyBoxItem();
                Store.Instance.placeBoxItem(y, x, null);
            }

            EventManager.Instance.event(MCustomEvent.CorrectCurrentBox);
        }
    }

    private createReadyBox() {
        let readyBox: Laya.Sprite = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
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

            let box: Laya.Sprite = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
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
            let clickBox: Laya.Sprite = Laya.Pool.getItemByCreateFun("ClickBox", this.ClickBox.create, this.ClickBox);

            let script: ClickBox = clickBox.getComponent(ClickBox);
            script.init(i);
            this.clickContainer.addChild(clickBox);
        }
    }
}
