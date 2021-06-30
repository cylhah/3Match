(function () {
  'use strict';

  class EventManager {
      constructor() {
          this.eventDispatcher = new Laya.EventDispatcher();
      }
      static get Instance() {
          if (!this.inst) {
              this.inst = new EventManager();
          }
          return this.inst;
      }
      hasListener(type) {
          return this.eventDispatcher.hasListener(type);
      }
      event(type, data) {
          return this.eventDispatcher.event(type, data);
      }
      on(type, caller, listener, arg) {
          return this.eventDispatcher.on(type, caller, listener, arg);
      }
      once(type, caller, listener, args) {
          return this.eventDispatcher.once(type, caller, listener, args);
      }
      off(type, caller, listener, onceOnly) {
          return this.eventDispatcher.off(type, caller, listener, onceOnly);
      }
      offAll(type) {
          return this.eventDispatcher.offAll(type);
      }
      offAllCaller(caller) {
          return this.eventDispatcher.offAllCaller(caller);
      }
      isMouseEvent(type) {
          return this.eventDispatcher.isMouseEvent(type);
      }
  }

  var MCustomEvent;
  (function (MCustomEvent) {
      MCustomEvent["ClickGameBoard"] = "ClickGameBoard";
  })(MCustomEvent || (MCustomEvent = {}));

  class Vector2 {
      constructor(nx, ny) {
          this.x = nx;
          this.y = ny;
      }
  }

  class MGameConfig {
  }
  MGameConfig.GameMeshWidth = 7;
  MGameConfig.GameMeshHeight = 8;
  MGameConfig.InitialGameMeshHeight = 2;
  MGameConfig.GameBoxItemSize = new Vector2(84, 84);
  MGameConfig.GameMeshStartPosition = new Vector2(0, 588);

  class ClickBox extends Laya.Script {
      init(gameMeshX) {
          this.gameMeshX = gameMeshX;
          let sprite = this.owner;
          let offsetX = ClickBox.ClickBoxStartPosition.x + gameMeshX * MGameConfig.GameBoxItemSize.x;
          sprite.pos(offsetX, 0);
      }
      onClick(e) {
          EventManager.Instance.event(MCustomEvent.ClickGameBoard, this.gameMeshX);
      }
  }
  ClickBox.ClickBoxStartPosition = new Vector2(66, 0);

  class Store {
      constructor() { }
      static get Instance() {
          if (!this.instance) {
              this.instance = new Store();
          }
          return this.instance;
      }
  }

  class BoxItem extends Laya.Script {
      init(type, id) {
          this.switchTexture(id);
          if (type == 0) {
              EventManager.Instance.on(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
              this.posToGameBoardReadyArea();
          }
      }
      switchTexture(id) {
          this.owner.loadImage(`image/box/game_box_${id}.png`);
      }
      posToGameBoardReadyArea() {
          this.owner.pos(252, -MGameConfig.GameBoxItemSize.x);
      }
      posToGameBoard(gameMeshX, gameMeshY) {
          let offset = this.transMeshXYToOffset(gameMeshX, gameMeshY);
          this.owner.pos(offset.x, offset.y);
      }
      onDestroy() {
          EventManager.Instance.off(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
      }
      transMeshXYToOffset(meshX, meshY) {
          return new Vector2(MGameConfig.GameMeshStartPosition.x + MGameConfig.GameBoxItemSize.x * meshX, MGameConfig.GameMeshStartPosition.y - MGameConfig.GameBoxItemSize.y * meshY);
      }
      onGameBoardClick(clickMeshX) {
          let sprite = this.owner;
          let offsetX = clickMeshX * MGameConfig.GameBoxItemSize.x;
          Laya.Tween.to(sprite, { x: offsetX, y: -MGameConfig.GameBoxItemSize.x }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, this.onTweenCompelete, [clickMeshX]));
      }
      calcDropY(dropX) {
          for (let i = 0; i < Store.Instance.GameBoardArray.length; i++) {
              let row = Store.Instance.GameBoardArray[i];
              if (row[dropX] == -1) {
                  return i;
              }
          }
      }
      onTweenCompelete(clickMeshX) {
          let sprite = this.owner;
          let dropY = this.calcDropY(clickMeshX);
          let offset = this.transMeshXYToOffset(clickMeshX, dropY);
          Laya.Tween.to(sprite, { x: offset.x, y: offset.y }, 300, Laya.Ease.linearNone);
      }
  }

  class Utils {
      static random(min, max) {
          return Math.floor(Math.random() * (max - min) + min);
      }
  }

  class MainGame extends Laya.Script {
      onAwake() {
          this.gameBoard = this.owner.getChildByName("GameBackground").getChildByName("GameBoard");
          this.clickContainer = this.owner.getChildByName("GameBackground").getChildByName("ClickContainer");
          this.initEventListener();
          this.initGameBoardDataArray();
          this.initGameBoard();
          this.initClickBoxes();
      }
      initEventListener() {
          EventManager.Instance.on(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
      }
      onGameBoardClick() {
      }
      initGameBoardDataArray() {
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
      initGameBoard() {
          let InitialGameCount = MGameConfig.InitialGameMeshHeight * MGameConfig.GameMeshWidth;
          for (let i = 0; i < InitialGameCount; i++) {
              let gameMeshX = i % MGameConfig.GameMeshWidth;
              let gameMeshY = Math.floor(i / MGameConfig.GameMeshWidth);
              let box = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
              let scirpt = box.getComponent(BoxItem);
              let itemId = Utils.random(1, 10);
              scirpt.init(1, itemId);
              scirpt.posToGameBoard(gameMeshX, gameMeshY);
              this.gameBoard.addChild(box);
              Store.Instance.GameBoardArray[gameMeshY][gameMeshX] = itemId;
          }
          let readyBox = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
          let scirpt = readyBox.getComponent(BoxItem);
          scirpt.init(0, 1);
          this.gameBoard.addChild(readyBox);
      }
      initClickBoxes() {
          for (let i = 0; i < MGameConfig.GameMeshWidth; i++) {
              let clickBox = Laya.Pool.getItemByCreateFun("ClickBox", this.ClickBox.create, this.ClickBox);
              let script = clickBox.getComponent(ClickBox);
              script.init(i);
              this.clickContainer.addChild(clickBox);
          }
      }
  }

  class GameConfig {
      constructor() { }
      static init() {
          var reg = Laya.ClassUtils.regClass;
          reg("script/MainGame.ts", MainGame);
          reg("script/BoxItem.ts", BoxItem);
          reg("script/ClickBox.ts", ClickBox);
      }
  }
  GameConfig.width = 720;
  GameConfig.height = 1280;
  GameConfig.scaleMode = "fixedauto";
  GameConfig.screenMode = "none";
  GameConfig.alignV = "top";
  GameConfig.alignH = "center";
  GameConfig.startScene = "Main/Main.scene";
  GameConfig.sceneRoot = "";
  GameConfig.debug = false;
  GameConfig.stat = false;
  GameConfig.physicsDebug = false;
  GameConfig.exportSceneToJson = true;
  GameConfig.init();

  class Main {
      constructor() {
          if (window["Laya3D"])
              Laya3D.init(GameConfig.width, GameConfig.height);
          else
              Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
          Laya["Physics"] && Laya["Physics"].enable();
          Laya["DebugPanel"] && Laya["DebugPanel"].enable();
          Laya.stage.scaleMode = GameConfig.scaleMode;
          Laya.stage.screenMode = GameConfig.screenMode;
          Laya.stage.alignV = GameConfig.alignV;
          Laya.stage.alignH = GameConfig.alignH;
          Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
          if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
              Laya.enableDebugPanel();
          if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
              Laya["PhysicsDebugDraw"].enable();
          if (GameConfig.stat)
              Laya.Stat.show();
          Laya.alertGlobalError(true);
          Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
      }
      onVersionLoaded() {
          Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
      }
      onConfigLoaded() {
          GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
      }
  }
  new Main();

}());
