import { DI, IContainer, IRegistry, PLATFORM, Registration } from '../kernel';
import { INode } from './dom';
import { LifecycleFlags } from './observation';
import { CustomElementResource, ICustomElement, ICustomElementType } from './templating/custom-element';
import { IRenderingEngine } from './templating/lifecycle-render';
import { IFabricNode } from './fabric-dom';
import { ILifecycle } from './lifecycle';
import { VNode } from 'dom/node';

export interface ISinglePageApp {
  host?: INode;
  component: unknown;
  canvas?: fabric.StaticCanvas;
  fabric?: fabric.IStaticCanvasOptions | fabric.ICanvasOptions;
}

export class Aurelia {
  private container: IContainer;
  private components: ICustomElement[];
  private startTasks: (() => void)[];
  private stopTasks: (() => void)[];
  private isStarted: boolean;
  private _root: ICustomElement | null;

  constructor(container: IContainer = DI.createContainer()) {
    this.container = container;
    this.components = [];
    this.startTasks = [];
    this.stopTasks = [];
    this.isStarted = false;
    this._root = null;

    Registration
      .instance(Aurelia, this)
      .register(container, Aurelia);
  }

  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp): this {
    const canvas = this.createCanvas(config) as fabric.StaticCanvas & { $au: Aurelia };
    const hostNode = new VNode('canvas', false);
    hostNode.nativeObject = canvas;
    let component: ICustomElement;
    const componentOrType = config.component as ICustomElement | ICustomElementType;
    if (CustomElementResource.isType(<ICustomElementType>componentOrType)) {
      this.container.register(<ICustomElementType>componentOrType);
      component = this.container.get<ICustomElement>(CustomElementResource.keyFrom((<ICustomElementType>componentOrType).description.name));
    } else {
      component = <ICustomElement>componentOrType;
    }

    const startTask = () => {
      canvas.$au = this;
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        const re = this.container.get(IRenderingEngine);
        component.$hydrate(re, hostNode);
      }

      component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
      component.$attach(LifecycleFlags.fromStartTask, hostNode);
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      component.$detach(LifecycleFlags.fromStopTask);
      component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
      canvas.$au = null;
    });

    if (this.isStarted) {
      startTask();
    }

    return this;
  }

  public root(): ICustomElement | null {
    return this._root;
  }

  public start(): this {
    for (const runStartTask of this.startTasks) {
      runStartTask();
    }
    this.isStarted = true;
    return this;
  }

  public stop(): this {
    this.isStarted = false;
    for (const runStopTask of this.stopTasks) {
      runStopTask();
    }
    return this;
  }

  public createCanvas(config: ISinglePageApp): fabric.StaticCanvas {
    if (config.canvas) {
      return config.canvas;
    }
    return new fabric.Canvas(config.host as HTMLCanvasElement, config.fabric);
  }
}

(<{Aurelia: unknown}>PLATFORM.global).Aurelia = Aurelia;
