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
        this.initGameBoardDataArray();
        this.initGameBoard();
        this.initClickBoxes();
    }

    private initEventListener() {
      EventManager.Instance.on(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
    }

    private onGameBoardClick() {

    }

    private initGameBoardDataArray() {
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

    private initGameBoard() {
        let InitialGameCount = MGameConfig.InitialGameMeshHeight * MGameConfig.GameMeshWidth;
        for (let i = 0; i < InitialGameCount; i++) {
            let gameMeshX = i % MGameConfig.GameMeshWidth;
            let gameMeshY = Math.floor(i / MGameConfig.GameMeshWidth);

            let box: Laya.Sprite = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
            let scirpt: BoxItem = box.getComponent(BoxItem);
            let itemId = Utils.random(1, 10);
            scirpt.init(1, itemId);
            scirpt.posToGameBoard(gameMeshX, gameMeshY);
            this.gameBoard.addChild(box);
            Store.Instance.GameBoardArray[gameMeshY][gameMeshX] = itemId;
        }

        let readyBox: Laya.Sprite = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
        let scirpt: BoxItem = readyBox.getComponent(BoxItem);
        scirpt.init(0, 1);
        this.gameBoard.addChild(readyBox);
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
