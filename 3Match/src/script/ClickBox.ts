import { Vector2 } from "./GameData/CommonData";
import { MGameConfig } from "./GameData/Variables";

export default class ClickBox extends Laya.Script {
  private static ClickBoxStartPosition: Vector2 = new Vector2(66, 0);
  private gameMeshX: number;

  init(gameMeshX: number) {
    this.gameMeshX = gameMeshX;

    let sprite = <Laya.Sprite>this.owner;
    let offsetX =
      ClickBox.ClickBoxStartPosition.x +
      gameMeshX * MGameConfig.GameBoxItemSize.x;
    sprite.pos(offsetX, 0);
  }

  onClick(e: Laya.Event) {
    console.log(this.gameMeshX);
  }
}
