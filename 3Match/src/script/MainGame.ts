import { Vector2 } from "./GameData/CommonData";

export default class MainGame extends Laya.Script {
  /** @prop {name:GameMeshWidth, tips:"网格总宽度", type:Int, default:7}*/
  public GameMeshWidth: number = 7;
  /** @prop {name:GameMeshHeight, tips:"网格总高度", type:Int, default:8}*/
  public GameMeshHeight: number = 8;
  /** @prop {name:GameBoxItem,tips:"游戏方块",type:Prefab}*/
  public GameBoxItem: Laya.Prefab;
  /** @prop {name:InitialGameMeshHeight, tips:"初始游戏高度", type:Int, default:2}*/
  public InitialGameMeshHeight: number = 2;

  private GameBoxItemSize: Vector2 = new Vector2(84, 84);
  private GameMeshStartPosition: Vector2 = new Vector2(0, 588);

  private gameBoard: Laya.Sprite;

  constructor() {
    super();
  }

  onAwake(): void {
    this.gameBoard = <Laya.Sprite>(
      this.owner.getChildByName("GameBackground").getChildByName("GameBoard")
    );

    let InitialGameCount = this.InitialGameMeshHeight * this.GameMeshWidth;
    for (let i = 0; i < InitialGameCount; i++) {
      let gameMeshX = i % this.GameMeshWidth;
      let gameMeshY = Math.floor(i / this.GameMeshWidth);

      let positionOffset = new Vector2(
        this.GameBoxItemSize.x * gameMeshX,
        this.GameBoxItemSize.y * gameMeshY
      );

      let positionX = this.GameMeshStartPosition.x + positionOffset.x;
      let positionY = this.GameMeshStartPosition.y - positionOffset.y;
      let box: Laya.Sprite = Laya.Pool.getItemByCreateFun(
        "GameBoxItem",
        this.GameBoxItem.create,
        this.GameBoxItem
      );
      box.pos(positionX, positionY);

      this.gameBoard.addChild(box);
    }
  }

  onEnable(): void {}

  onDisable(): void {}
}
