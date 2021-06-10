import ClickBox from "../script/ClickBox";
import { MGameConfig } from "./GameData/Variables";

export default class MainGame extends Laya.Script {
  /** @prop {name:GameBoxItem,tips:"游戏方块",type:Prefab}*/
  public GameBoxItem: Laya.Prefab;
  /** @prop {name:ClickBox,type:Prefab}*/
  public ClickBox: Laya.Prefab;

  private gameBoard: Laya.Sprite;
  private clickContainer: Laya.Sprite;

  onAwake(): void {
    this.gameBoard = <Laya.Sprite>(
      this.owner.getChildByName("GameBackground").getChildByName("GameBoard")
    );
    this.clickContainer = <Laya.Sprite>(
      this.owner
        .getChildByName("GameBackground")
        .getChildByName("ClickContainer")
    );

    this.initGameBoard();
    this.initClickBoxes();
  }

  initGameBoard() {
    let InitialGameCount =
      MGameConfig.InitialGameMeshHeight * MGameConfig.GameMeshWidth;
    for (let i = 0; i < InitialGameCount; i++) {
      let gameMeshX = i % MGameConfig.GameMeshWidth;
      let gameMeshY = Math.floor(i / MGameConfig.GameMeshWidth);

      let positionX =
        MGameConfig.GameMeshStartPosition.x +
        MGameConfig.GameBoxItemSize.x * gameMeshX;
      let positionY =
        MGameConfig.GameMeshStartPosition.y -
        MGameConfig.GameBoxItemSize.y * gameMeshY;
      let box: Laya.Sprite = Laya.Pool.getItemByCreateFun(
        "GameBoxItem",
        this.GameBoxItem.create,
        this.GameBoxItem
      );
      box.pos(positionX, positionY);

      this.gameBoard.addChild(box);
    }
  }

  initClickBoxes() {
    for (let i = 0; i < MGameConfig.GameMeshWidth; i++) {
      let clickBox: Laya.Sprite = Laya.Pool.getItemByCreateFun(
        "ClickBox",
        this.ClickBox.create,
        this.ClickBox
      );

      let script: ClickBox = clickBox.getComponent(ClickBox);
      script.init(i);
      this.clickContainer.addChild(clickBox);
    }
  }
}
