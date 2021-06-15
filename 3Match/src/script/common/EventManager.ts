export class EventManager {
  private static inst: EventManager;
  private eventDispatcher: Laya.EventDispatcher;
  private constructor() {
    this.eventDispatcher = new Laya.EventDispatcher();
  }

  public static get Instance() {
    if (!this.inst) {
      this.inst = new EventManager();
    }

    return this.inst;
  }

  public hasListener(type: string) {
    return this.eventDispatcher.hasListener(type);
  }

  public event(type: string, data?: any) {
    return this.eventDispatcher.event(type, data);
  }

  public on(type: string, caller: any, listener: Function, arg?: any[]) {
    return this.eventDispatcher.on(type, caller, listener, arg);
  }

  public once(type: string, caller: any, listener: Function, args?: any[]) {
    return this.eventDispatcher.once(type, caller, listener, args);
  }

  public off(
    type: string,
    caller: any,
    listener: Function,
    onceOnly?: boolean
  ) {
    return this.eventDispatcher.off(type, caller, listener, onceOnly);
  }

  public offAll(type?: string) {
    return this.eventDispatcher.offAll(type);
  }

  public offAllCaller(caller: any) {
    return this.eventDispatcher.offAllCaller(caller);
  }

  public isMouseEvent(type: string) {
    return this.eventDispatcher.isMouseEvent(type);
  }
}
