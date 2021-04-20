export default class MainGame extends Laya.Script {
    /** @prop {name:GameMeshWidth, tips:"网格总宽度", type:Int, default:7}*/
    public GameMeshWidth: number = 7;
    /** @prop {name:GameMeshHeight, tips:"网格总高度", type:Int, default:8}*/
    public GameMeshHeight: number = 8;
    /** @prop {name:GameBoxItem,tips:"游戏方块",type:Prefab}*/
    public GameBoxItem: Laya.Prefab;
    /** @prop {name:InitialGameMeshHeight, tips:"初始游戏高度", type:Int, default:2}*/
    public InitialGameMeshHeight: number = 2;

    private GameBoxItemSize: Laya.Vector2 = new Laya.Vector2(84, 84);
    private GameMeshStartPosition: Laya.Vector2 = new Laya.Vector2(10, 907);

    constructor() { super(); }

    onAwake(): void {
        let InitialGameCount = this.InitialGameMeshHeight * this.GameMeshWidth;
        for (let i = 0; i < InitialGameCount; i++) {
            let gameMeshX = i % this.GameMeshWidth;
            let gameMeshY = i / this.GameMeshWidth;

            let positionOffset = new Laya.Vector2(this.GameBoxItemSize.x * gameMeshX, this.GameBoxItemSize.y * gameMeshY);

            let positionX = this.GameMeshStartPosition.x + positionOffset.x;
            let positionY = this.GameMeshStartPosition.y + positionOffset.y;
            let box: Laya.Sprite = Laya.Pool.getItemByCreateFun("GameBoxItem", this.GameBoxItem.create, this.GameBoxItem);
            box.pos(positionX, positionY);
        }
    }

    onEnable(): void {
    }

    onDisable(): void {
    }
}