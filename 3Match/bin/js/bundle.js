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
        MCustomEvent["BoxItemDrop"] = "BoxItemDrop";
        MCustomEvent["CreateNewReadyBox"] = "CreateNewReadyBox";
        MCustomEvent["CorrectCurrentBox"] = "CorrectCurrentBox";
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

    class Utils {
        static random(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        static fill2DAry(l1, l2, value) {
            let ary = [];
            for (let i = 0; i < l1; i++) {
                for (let j = 0; j < l2; j++) {
                    if (!ary[i]) {
                        ary[i] = [];
                    }
                    ary[i][j] = value;
                }
            }
            return ary;
        }
    }

    class Store {
        constructor() { }
        static get Instance() {
            if (!this.instance) {
                this.instance = new Store();
            }
            return this.instance;
        }
        init() {
            this.GameBoardArray = Utils.fill2DAry(MGameConfig.GameMeshHeight, MGameConfig.GameMeshWidth, null);
        }
        placeBoxItem(meshX, meshY, item) {
            this.GameBoardArray[meshY][meshX] = item;
        }
        getBoxItemId(meshX, meshY) {
            if (meshY < 0 || meshY >= MGameConfig.GameMeshHeight || meshX < 0 || meshX >= MGameConfig.GameMeshWidth)
                return null;
            let item = this.GameBoardArray[meshY][meshX];
            return item ? item.boxId : null;
        }
        calcDropY(dropX) {
            for (let i = 0; i < this.GameBoardArray.length; i++) {
                let row = this.GameBoardArray[i];
                if (row[dropX] == null) {
                    return i;
                }
            }
        }
    }

    class BoxItem extends Laya.Script {
        constructor() {
            super(...arguments);
            this.meshX = -1;
            this.meshY = -1;
        }
        init(id) {
            this.boxId = id;
            this.switchTargetImage(id);
        }
        switchTargetImage(id) {
            this.owner.loadImage(`image/box/game_box_${id}.png`);
        }
        updateSelfXYData(gameMeshX, gameMeshY) {
            this.meshX = gameMeshX;
            this.meshY = gameMeshY;
        }
        posToGameBoard(gameMeshX, gameMeshY) {
            let offset = this.transMeshXYToOffset(gameMeshX, gameMeshY);
            this.owner.pos(offset.x, offset.y);
            this.updateSelfXYData(gameMeshX, gameMeshY);
        }
        currectBox() {
            let downStep = 0;
            for (let i = this.meshY - 1; i >= 0; i--) {
                let downItem = Store.Instance.GameBoardArray[i][this.meshX];
                if (!downItem) {
                    downStep++;
                }
            }
            if (downStep > 0) {
                let newY = this.meshY - downStep;
                let item = Store.Instance.GameBoardArray[this.meshY][this.meshX];
                if (item == this) {
                    Store.Instance.placeBoxItem(this.meshX, this.meshY, null);
                }
                this.posToGameBoard(this.meshX, newY);
                Store.Instance.placeBoxItem(this.meshX, this.meshY, this);
                return this;
            }
            else {
                return null;
            }
        }
        destroyBoxItem() {
            this.owner.destroy();
        }
        transMeshXYToOffset(meshX, meshY) {
            return new Vector2(MGameConfig.GameMeshStartPosition.x + MGameConfig.GameBoxItemSize.x * meshX, MGameConfig.GameMeshStartPosition.y - MGameConfig.GameBoxItemSize.y * meshY);
        }
    }

    class ReadyBox extends Laya.Script {
        onAwake() {
            EventManager.Instance.on(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
        }
        onDestroy() {
            EventManager.Instance.off(MCustomEvent.ClickGameBoard, this, this.onGameBoardClick);
            EventManager.Instance.event(MCustomEvent.CreateNewReadyBox);
        }
        onGameBoardClick(clickMeshX) {
            let sprite = this.owner;
            let offsetX = clickMeshX * MGameConfig.GameBoxItemSize.x;
            Laya.Tween.to(sprite, { x: offsetX, y: -MGameConfig.GameBoxItemSize.x }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, this.onTweenCompelete, [clickMeshX]));
        }
        onTweenCompelete(clickMeshX) {
            let sprite = this.owner;
            let dropY = Store.Instance.calcDropY(clickMeshX);
            let offset = this.transMeshXYToOffset(clickMeshX, dropY);
            Laya.Tween.to(sprite, { x: offset.x, y: offset.y }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, this.onDropCompelete, [clickMeshX, dropY]));
        }
        transMeshXYToOffset(meshX, meshY) {
            return new Vector2(MGameConfig.GameMeshStartPosition.x + MGameConfig.GameBoxItemSize.x * meshX, MGameConfig.GameMeshStartPosition.y - MGameConfig.GameBoxItemSize.y * meshY);
        }
        onDropCompelete(meshX, meshY) {
            let boxItemScript = this.owner.getComponent(BoxItem);
            Store.Instance.placeBoxItem(meshX, meshY, boxItemScript);
            boxItemScript.updateSelfXYData(meshX, meshY);
            EventManager.Instance.event(MCustomEvent.BoxItemDrop, [meshX, meshY]);
            this.destroy();
        }
        posToGameBoardReadyArea() {
            this.owner.pos(252, -MGameConfig.GameBoxItemSize.x);
        }
    }

    class MainGame extends Laya.Script {
        onAwake() {
            this.gameBoard = this.owner.getChildByName("GameBackground").getChildByName("GameBoard");
            this.clickContainer = this.owner.getChildByName("GameBackground").getChildByName("ClickContainer");
            this.initEventListener();
            Store.Instance.init();
            this.initGameBoard();
            this.initClickBoxes();
        }
        onDestroy() {
            this.removeEventListener();
        }
        initEventListener() {
            EventManager.Instance.on(MCustomEvent.CreateNewReadyBox, this, this.createReadyBox);
            EventManager.Instance.on(MCustomEvent.BoxItemDrop, this, this.onBoxItemDrop);
        }
        removeEventListener() {
            EventManager.Instance.off(MCustomEvent.CreateNewReadyBox, this, this.createReadyBox);
            EventManager.Instance.off(MCustomEvent.BoxItemDrop, this, this.onBoxItemDrop);
        }
        onBoxItemDrop(meshX, meshY) {
            this.handleMatch(meshX, meshY);
        }
        calcMatchedItemAry(meshX, meshY) {
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
            return matchedItemAry;
        }
        handleMatch(meshX, meshY) {
            let targetId = Store.Instance.getBoxItemId(meshX, meshY);
            if (targetId == null)
                return;
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
        currectCurrentGameBoard() {
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
        createReadyBox() {
            let readyBox = this.GameBoxItem.create();
            let boxItem = readyBox.getComponent(BoxItem);
            boxItem.init(this.getRandomItemId());
            let readyBoxScript = readyBox.addComponent(ReadyBox);
            readyBoxScript.posToGameBoardReadyArea();
            this.gameBoard.addChild(readyBox);
        }
        getRandomItemId() {
            return Utils.random(1, 10);
        }
        initGameBoard() {
            let InitialGameCount = MGameConfig.InitialGameMeshHeight * MGameConfig.GameMeshWidth;
            for (let i = 0; i < InitialGameCount; i++) {
                let gameMeshX = i % MGameConfig.GameMeshWidth;
                let gameMeshY = Math.floor(i / MGameConfig.GameMeshWidth);
                let box = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
                let scirpt = box.getComponent(BoxItem);
                let itemId = this.getRandomItemId();
                scirpt.init(itemId);
                scirpt.posToGameBoard(gameMeshX, gameMeshY);
                this.gameBoard.addChild(box);
                Store.Instance.GameBoardArray[gameMeshY][gameMeshX] = scirpt;
            }
            this.createReadyBox();
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
