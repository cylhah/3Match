import { EventManager } from "./common/EventManager";
import { MCustomEvent } from "./common/MCustomEvent";
import { MGameConfig } from "./gameData/Variables";

export default class BoxItem extends Laya.Script {
  private type: number;

  /**
   * 初始化
   * @param type 0: GameBoard上方即将下落的box 1: 在GameBoard里的box
   */
  init(type: number) {
    if (type == 0) {
      EventManager.Instance.on(
        MCustomEvent.ClickGameBoard,
        this,
        this.onGameBoardClick
      );

      this.posToGameBoardReadyArea();

      // let rigidBody: Laya.RigidBody = this.owner.getComponent(Laya.RigidBody);
      // rigidBody.destroy();
    //   rigidBody.
    }
  }

  posToGameBoardReadyArea() {
    console.log("posToGameBoardReadyArea");
    (<Laya.Sprite>this.owner).pos(252, -84);
  }

  posToGameBoard(gameMeshX: number, gameMeshY: number) {
    let positionX =
      MGameConfig.GameMeshStartPosition.x +
      MGameConfig.GameBoxItemSize.x * gameMeshX;
    let positionY =
      MGameConfig.GameMeshStartPosition.y -
      MGameConfig.GameBoxItemSize.y * gameMeshY;
    (<Laya.Sprite>this.owner).pos(positionX, positionY);
  }

  onDestroy() {
    EventManager.Instance.off(
      MCustomEvent.ClickGameBoard,
      this,
      this.onGameBoardClick
    );
  }

  onGameBoardClick(clickMeshX: number) {
    console.log("onGameBoardClick", clickMeshX);
    let sprite = <Laya.Sprite>this.owner;
    let offsetX = clickMeshX * 84;
    Laya.Tween.to(
      sprite,
      { x: offsetX, y: -84 },
      300,
      Laya.Ease.linearNone,
      Laya.Handler.create(this, this.onTweenCompelete)
    );
  }

  onTweenCompelete() {
    // let rigidBody: Laya.RigidBody = this.owner.getComponent(Laya.RigidBody);
    this.owner.addComponent(Laya.RigidBody);
    // rigidBody.enabled = true;
  }
}
