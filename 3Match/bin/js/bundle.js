(function () {
  'use strict';

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
          let offsetX = ClickBox.ClickBoxStartPosition.x +
              gameMeshX * MGameConfig.GameBoxItemSize.x;
          sprite.pos(offsetX, 0);
      }
      onClick(e) {
          console.log(this.gameMeshX);
      }
  }
  ClickBox.ClickBoxStartPosition = new Vector2(66, 0);

  class MainGame extends Laya.Script {
      onAwake() {
          this.gameBoard = (this.owner.getChildByName("GameBackground").getChildByName("GameBoard"));
          this.clickContainer = (this.owner
              .getChildByName("GameBackground")
              .getChildByName("ClickContainer"));
          this.initGameBoard();
          this.initClickBoxes();
      }
      initGameBoard() {
          let InitialGameCount = MGameConfig.InitialGameMeshHeight * MGameConfig.GameMeshWidth;
          for (let i = 0; i < InitialGameCount; i++) {
              let gameMeshX = i % MGameConfig.GameMeshWidth;
              let gameMeshY = Math.floor(i / MGameConfig.GameMeshWidth);
              let positionX = MGameConfig.GameMeshStartPosition.x +
                  MGameConfig.GameBoxItemSize.x * gameMeshX;
              let positionY = MGameConfig.GameMeshStartPosition.y -
                  MGameConfig.GameBoxItemSize.y * gameMeshY;
              let box = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
              box.pos(positionX, positionY);
              this.gameBoard.addChild(box);
          }
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

  var Scene = Laya.Scene;
  var REG = Laya.ClassUtils.regClass;
  var ui;
  (function (ui) {
      var test;
      (function (test) {
          class TestSceneUI extends Scene {
              constructor() { super(); }
              createChildren() {
                  super.createChildren();
                  this.loadScene("test/TestScene");
              }
          }
          test.TestSceneUI = TestSceneUI;
          REG("ui.test.TestSceneUI", TestSceneUI);
      })(test = ui.test || (ui.test = {}));
  })(ui || (ui = {}));

  class GameControl extends Laya.Script {
      constructor() {
          super();
          this.createBoxInterval = 1000;
          this._time = 0;
          this._started = false;
      }
      onEnable() {
          this._time = Date.now();
          this._gameBox = this.owner.getChildByName("gameBox");
      }
      onUpdate() {
          let now = Date.now();
          if (now - this._time > this.createBoxInterval && this._started) {
              this._time = now;
              this.createBox();
          }
      }
      createBox() {
          let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
          box.pos(Math.random() * (Laya.stage.width - 100), -100);
          this._gameBox.addChild(box);
      }
      onStageClick(e) {
          e.stopPropagation();
          let flyer = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
          flyer.pos(Laya.stage.mouseX, Laya.stage.mouseY);
          this._gameBox.addChild(flyer);
      }
      startGame() {
          if (!this._started) {
              this._started = true;
              this.enabled = true;
          }
      }
      stopGame() {
          this._started = false;
          this.enabled = false;
          this.createBoxInterval = 1000;
          this._gameBox.removeChildren();
      }
  }

  class GameUI extends ui.test.TestSceneUI {
      constructor() {
          super();
          GameUI.instance = this;
          Laya.MouseManager.multiTouchEnabled = false;
      }
      onEnable() {
          this._control = this.getComponent(GameControl);
          this.tipLbll.on(Laya.Event.CLICK, this, this.onTipClick);
      }
      onTipClick(e) {
          this.tipLbll.visible = false;
          this._score = 0;
          this.scoreLbl.text = "";
          this._control.startGame();
      }
      addScore(value = 1) {
          this._score += value;
          this.scoreLbl.changeText("分数：" + this._score);
          if (this._control.createBoxInterval > 600 && this._score % 20 == 0)
              this._control.createBoxInterval -= 20;
      }
      stopGame() {
          this.tipLbll.visible = true;
          this.tipLbll.text = "游戏结束了，点击屏幕重新开始";
          this._control.stopGame();
      }
  }

  class Bullet extends Laya.Script {
      constructor() { super(); }
      onEnable() {
          var rig = this.owner.getComponent(Laya.RigidBody);
          rig.setVelocity({ x: 0, y: -10 });
      }
      onTriggerEnter(other, self, contact) {
          this.owner.removeSelf();
      }
      onUpdate() {
          if (this.owner.y < -10) {
              this.owner.removeSelf();
          }
      }
      onDisable() {
          Laya.Pool.recover("bullet", this.owner);
      }
  }

  class DropBox extends Laya.Script {
      constructor() {
          super();
          this.level = 1;
      }
      onEnable() {
          this._rig = this.owner.getComponent(Laya.RigidBody);
          this.level = Math.round(Math.random() * 5) + 1;
          this._text = this.owner.getChildByName("levelTxt");
          this._text.text = this.level + "";
      }
      onUpdate() {
          this.owner.rotation++;
      }
      onTriggerEnter(other, self, contact) {
          var owner = this.owner;
          if (other.label === "buttle") {
              if (this.level > 1) {
                  this.level--;
                  this._text.changeText(this.level + "");
                  owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                  Laya.SoundManager.playSound("sound/hit.wav");
              }
              else {
                  if (owner.parent) {
                      let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                      effect.pos(owner.x, owner.y);
                      owner.parent.addChild(effect);
                      effect.play(0, true);
                      owner.removeSelf();
                      Laya.SoundManager.playSound("sound/destroy.wav");
                  }
              }
              GameUI.instance.addScore(1);
          }
          else if (other.label === "ground") {
              owner.removeSelf();
              GameUI.instance.stopGame();
          }
      }
      createEffect() {
          let ani = new Laya.Animation();
          ani.loadAnimation("test/TestAni.ani");
          ani.on(Laya.Event.COMPLETE, null, recover);
          function recover() {
              ani.removeSelf();
              Laya.Pool.recover("effect", ani);
          }
          return ani;
      }
      onDisable() {
          Laya.Pool.recover("dropBox", this.owner);
      }
  }

  class GameConfig {
      constructor() {
      }
      static init() {
          var reg = Laya.ClassUtils.regClass;
          reg("script/ClickBox.ts", ClickBox);
          reg("script/MainGame.ts", MainGame);
          reg("script/GameUI.ts", GameUI);
          reg("script/GameControl.ts", GameControl);
          reg("script/Bullet.ts", Bullet);
          reg("script/DropBox.ts", DropBox);
      }
  }
  GameConfig.width = 720;
  GameConfig.height = 1280;
  GameConfig.scaleMode = "fixedheight";
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
