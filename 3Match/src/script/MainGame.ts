import ClickBox from "../script/ClickBox";
import BoxItem from "../script/BoxItem";
import { MGameConfig } from "./gameData/Variables";
import { Utils } from "./common/Utils";
import { EventManager } from "./common/EventManager";
import { MCustomEvent } from "./common/MCustomEvent";
import { Store } from "./common/Store";

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

    private initEventListener() {
        EventManager.Instance.on(MCustomEvent.BoxItemDrop, this, this.onBoxItemDrop);
        // EventManager.Instance.on(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
    }

    private onBoxItemDrop() {
        this.createReadyBox();
    }

    private createReadyBox() {
        let readyBox: Laya.Sprite = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
        let scirpt: BoxItem = readyBox.getComponent(BoxItem);
        scirpt.init(0, this.getRandomItemId());
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
            scirpt.init(1, itemId);
            scirpt.posToGameBoard(gameMeshX, gameMeshY);
            this.gameBoard.addChild(box);
            Store.Instance.GameBoardArray[gameMeshY][gameMeshX] = itemId;
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
