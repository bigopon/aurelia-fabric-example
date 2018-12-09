import { EventTarget } from "./EventTarget";

const emptyNodesArray = Object.freeze([]) as VNode[];
const emptyObject = Object.freeze({}) as Record<string, any>;
export class VNode<T = any> extends EventTarget {

  static invokeNativeObject: <TType = any>(node: VNode<TType>, ...args: any[]) => void;

  nativeObject: T;
  nodeName: string;

  parentNode: VNode<T> | null;
  childNodes: VNode[];
  attributes: Record<string, any>;

  constructor(name: string) {
    super();
    this.nodeName = name;
    this.parentNode = null;
    this.childNodes = emptyNodesArray;
    this.attributes = emptyObject;
  }

  invokeNativeObject(): T {
    VNode.invokeNativeObject(this);
    this.childNodes.forEach(VNode.invokeNativeObject);
    return this.nativeObject;
  }

  setAttribute(name: string, value: string): void {
    let attributes = this.attributes;
    if (attributes === emptyObject) {
      attributes = this.attributes = {};
    }
    attributes[name] = value;
  }

  getAttribute(name: string): any {
    return this.attributes[name];
  }

  removeAttribute(name: string): void {
    delete this.attributes[name];
  }

  hasAttribute(name: string): boolean {
    return name in this.attributes;
  }

  appendChild(node: VNode<T>): VNode<T> {
    let childNodes = this.childNodes;
    if (childNodes === emptyNodesArray) {
      childNodes = [];
    }
    childNodes.push(node);
    node.parentNode = this;
    return node;
  }

  insertBefore(node: VNode<T>, refNode: VNode<T>): VNode<T> {
    if (refNode.parentNode !== this) {
      throw new Error('Referenced node is not a child node');
    }
    let childNodes = this.childNodes;
    if (childNodes === emptyNodesArray) {
      childNodes = this.childNodes = [];
    }
    let idx = childNodes.indexOf(refNode);
    childNodes.splice(idx, 0, node);
    node.parentNode = this;
    return node;
  }

  removeChild(node: VNode<T>): VNode<T> {
    let childNodes = this.childNodes;
    let idx = childNodes.indexOf(node);
    if (idx !== -1) {
      childNodes.splice(idx, 1);
    } else {
      throw new Error('Node to remove is not a child node');
    }
    node.parentNode = null;
    return node;
  }

  get nextSibling(): VNode<T> | null {
    let parent = this.parentNode;
    if (parent !== null) {
      let parentChildNodes = parent.childNodes;
      let idx = parentChildNodes.indexOf(this);
      if (idx !== -1 && idx < parentChildNodes.length - 1) {
        return parentChildNodes[idx + 1];
      }
    }
    return null;
  }

  get previousSibling(): VNode<T> | null {
    let parent = this.parentNode;
    if (parent !== null) {
      let parentChildNodes = parent.childNodes;
      let idx = parentChildNodes.indexOf(this);
      if (idx !== -1 && idx > 0) {
        return parentChildNodes[idx - 1];
      }
    }
    return null;
  }
}