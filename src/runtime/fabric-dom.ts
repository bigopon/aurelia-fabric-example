/// <reference path="./fabric-types.d.ts" />
import { PLATFORM, DI, Constructable, Writable, IContainer, IResolver } from '../kernel';
import { document, INode } from './dom';


function isRenderLocation(node: IFabricNode): node is IKonvaRenderLocation {
  return node instanceof konva.Node && node.nodeName === '#comment';
}

const FabricDomMap: Record<string, (node?: Element) => IFabricNode> = {};
export const FabricDOM = new class {
  registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(IFabricNode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    // container.registerResolver(SVGElement, resolver);
  }
  createDocumentFragment(markupOrNode?: any): DocumentFragment {
    if (markupOrNode === undefined || markupOrNode === null) {
      return document.createDocumentFragment();
    }
    if (markupOrNode.nodeType > 0) {
      if (markupOrNode.content !== undefined) {
        return markupOrNode.content;
      }
      const fragment = document.createDocumentFragment();
      fragment.appendChild(markupOrNode);
      return fragment;
    }
    return FabricDOM.createTemplate(<string>markupOrNode).content;
  }
  createTemplate(markup?: string): HTMLTemplateElement {
    if (markup === undefined) {
      return document.createElement('template');
    }
    const template = document.createElement('template');
    template.innerHTML = markup;
    return template;
  }
  convertToRenderLocation(node: any) {
    if (isRenderLocation(node)) {
      // it's already a RenderLocation (converted by FragmentNodeSequence)
      return node;
    }
    if (!node.parent) {
      throw new Error('No parent???');
    }
    const locationEnd = FabricDOM.createComment('au-end') as IKonvaRenderLocation;
    const locationStart = FabricDOM.createComment('au-start') as IKonvaRenderLocation;
    FabricDOM.replaceNode(locationEnd, node);
    FabricDOM.insertBefore(locationStart, locationEnd);
    locationEnd.$start = locationStart;
    // locationStart.$nodes = null;
    return locationEnd
  }
  /**
  * Create basic node of a PIXI DOM
  */
  createComment(text: string): IFabricNode {
    const dObj: IFabricNode = new konva.Node({});
    dObj.nodeName = '#comment';
    dObj.textContent = text;
    return dObj;
  }
  createTextNode(text: string): IFabricNode {
    const textNode: IFabricNode = new konva.Text({ text });
    textNode.nodeName = '#text';
    return textNode;
  }
  // createElement(tagName: 'Text'): TextBase;
  // createElement(tagName: 'Button'): Button;
  // createElement(tagName: 'Frame'): Frame;
  createElement(tagName: string, node?: Element): IFabricNode;
  createElement(tagName: string, node?: Element): IFabricNode {
    if (!(tagName in FabricDomMap)) {
      console.log(Object.keys(FabricDomMap));
      throw new Error('There is no element with ' + tagName + ' registered');
    }
    let blessedNode: IFabricNode = FabricDomMap[tagName](node);
    blessedNode.nodeName = tagName;
    return blessedNode;
  }
  remove<T extends IFabricNode = IFabricNode>(childView: T, parentView?: IFabricNode): T | null {
    // // if (node.parent) {
    // //   node.parent.removeChild(node);
    // //   return node;
    // // }
    // // return null;
    // parentView = parentView || childView.parent as ILibUiNode;
    // if (!parentView) {
    //   return null;
    // }
    // // if (parentNode.meta && typeof parentNode.meta.removeChild === 'function') {
    // //   return parentNode.meta.removeChild(parentNode, childNode)
    // // }

    // // if (childNode.meta.skipAddToDom) {
    // //   return
    // // }

    // // const parentView = parentNode.nativeView
    // // const childView = childNode.nativeView

    // if (isLayout(parentView)) {
    //   parentView.removeChild(childView)
    // } else if (isContentView(parentView)) {
    //   if (parentView.content === childView) {
    //     parentView.content = null
    //   }

    //   if (childView.nodeType === 8 || childView.nodeName === '#comment') {
    //     parentView._removeView(childView);
    //   }
    // } else if (isView(parentView)) {
    //   parentView._removeView(childView);
    // } else {
    //   // throw new Error("Unknown parent type: " + parent);
    // }
    throw new Error('Not easy to remove');
  }
  replaceNode(newNode: IFabricNode, refNode: IFabricNode) {
    FabricDOM.insertBefore(newNode, refNode);
    FabricDOM.remove(refNode);
    // refNode.parent.insertBefore(newNode, refNode);
    // refNode.parent.removeChild(refNode);
    return newNode;
  }
  insertBefore<T extends IFabricNode = IFabricNode>(newNode: T, refNode: IFabricNode): T {
    const parentNode = refNode.getParent();
    if (!parentNode) {
      throw new Error('No parent');
    }
    parentNode.add(newNode);
    return newNode;
  }
  appendChild<T extends IFabricNode = IFabricNode>(node: T, parentNode: IFabricNode): T {
    if (FabricDOM.isCollection(parentNode)) {
      parentNode.add(node);
    } else {
      throw new Error(`Cannot add ${node.nodeName} node to ${parentNode.nodeName} node`);
    }
    return node;
  }
  isNodeInstance(node: any): node is IFabricNode {
    return node instanceof fabric.Object;
  }
  map(tagName: string, ctor: ((node?: Element) => IFabricNode)): void {
    if (tagName in FabricDomMap) {
      throw new Error(`Element with the same name "${tagName}" already exists`);
    }
    FabricDomMap[tagName] = ctor;
  }
  isCollection<T extends IFabricNode>(node: any): node is fabric.ICollection<T> {
    return node instanceof fabric.StaticCanvas || node instanceof fabric.Group;
  }

  treatAsNonWhitespace(node: IFabricNode): void {
    // see isAllWhitespace above
    (<any>node).auInterpolationTarget = true;
  }
};

export const IFabricNode = DI.createInterface<IFabricNode>().noDefault();
export interface IFabricNode extends fabric.Object {
  nodeType?: number;
  nodeName?: string;
  textContent?: string;
  firstChild?: IFabricNode | null;
  lastChild?: IFabricNode | null;
  nextSibling?: IFabricNode | null;
  previousSibling?: IFabricNode | null;
}
export const IKonvaRenderLocation = DI.createInterface<IKonvaRenderLocation>().noDefault();
export interface IKonvaRenderLocation extends IFabricNode {
  $start: IKonvaRenderLocation;
  $nodes: IFabricNodeSequence;
}
/**
* Represents a DocumentFragment
*/
export interface IFabricNodeSequence {
  firstChild: IFabricNode;
  lastChild: IFabricNode;
  /**
   * The nodes of this sequence.
   */
  children: ReadonlyArray<IFabricNode>;
  /**
  * Find all instruction targets in this sequence.
  */
  findTargets(): ReadonlyArray<IFabricNode>;
  /**
  * Insert this sequence as a sibling before refNode
  */
  insertBefore(refNode: IFabricNode): void;
  /**
  * Append this sequence as a child to parent
  */
  appendTo(parent: IFabricNode): void;
  /**
  * Remove this sequence from its parent.
  */
  remove(): void;
}
// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: IFabricNodeSequence = {
  firstChild: null,
  lastChild: null,
  children: PLATFORM.emptyArray,
  findTargets(): ReturnType<IFabricNodeSequence['findTargets']> { return PLATFORM.emptyArray; },
  insertBefore(refNode: IFabricNode): ReturnType<IFabricNodeSequence['insertBefore']> { /*do nothing*/ },
  appendTo(parent: IFabricNode): ReturnType<IFabricNodeSequence['appendTo']> { /*do nothing*/ },
  remove(): ReturnType<IFabricNodeSequence['remove']> { /*do nothing*/ }
};
export const BlessedNodeSequence = {
  empty: emptySequence
};
/**
* An specialized INodeSequence with optimizations for text (interpolation) bindings
* The contract of this INodeSequence is:
* - the previous element is an `au-marker` node
* - text is the actual text node
*/
export class FabricTextNodeSequence implements IFabricNodeSequence {
  public firstChild: IFabricNode;
  public lastChild: IFabricNode;
  public children: IFabricNode[];
  private targets: ReadonlyArray<IFabricNode>;
  constructor(text: IFabricNode) {
    this.firstChild = text;
    this.lastChild = text;
    this.children = [text];
    this.targets = [];
    // this.targets = [new AuMarker(text)];
  }
  public findTargets(): ReadonlyArray<IFabricNode> {
    return this.targets;
  }
  public insertBefore(refNode: IFabricNode): void {
    FabricDOM.insertBefore(this.firstChild, refNode);
    // refNode.parent.insertBefore(this.firstChild, refNode);
  }
  public appendTo(parent: IFabricNode): void {
    // parent.addChild(this.firstChild);
    FabricDOM
  }
  public remove(): void {
    (<any>this.firstChild).remove();
  }
}
// tslint:enable:no-any
// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/*@internal*/
export class FabricFragmentNodeSequence implements IFabricNodeSequence {
  public firstChild: IFabricNode;
  public lastChild: IFabricNode;
  public children: ReadonlyArray<IFabricNode>;
  private fragment: DocumentFragment;
  private targets: ReadonlyArray<IFabricNode>;
  private start: IKonvaRenderLocation;
  private end: IKonvaRenderLocation;
  constructor(fragment: DocumentFragment) {
    this.fragment = fragment;
    const targetNodeList: IFabricNode[] = [];
    const nsNodes = this.children = nodeToFabricVNodes(fragment.childNodes, null, targetNodeList);
    // tslint:disable-next-line:no-any
    // const targetNodeList = fragment.querySelectorAll('.au');
    let i = 0;
    let ii = targetNodeList.length;
    const targets = this.targets = Array(ii);
    while (i < ii) {
      // eagerly convert all markers to IRenderLocations (otherwise the renderer
      // will do it anyway) and store them in the target list (since the comments
      // can't be queried)
      const target = targetNodeList[i];
      if (target.nodeName === 'au-marker') {
        // note the renderer will still call this method, but it will just return the
        // location if it sees it's already a location
        targets[i] = FabricDOM.convertToRenderLocation(target);
      } else {
        // also store non-markers for consistent ordering
        targets[i] = target;
      }
      ++i;
    }
    // const childNodeList = fragment.childNodes;
    // i = 0;
    // ii = childNodeList.length;
    // const childNodes = this.children = Array(ii);
    // while (i < ii) {
    //   childNodes[i] = childNodeList[i] as Writable<INode>;
    //   ++i;
    // }
    const nodeCount = nsNodes.length;
    this.firstChild = nodeCount > 0 ? nsNodes[0] : null;
    this.lastChild = nodeCount > 0 ? nsNodes[nodeCount - 1] : null;
    this.start = this.end = null;
  }
  public findTargets(): ReadonlyArray<IFabricNode> {
    // tslint:disable-next-line:no-any
    return this.targets;
  }
  public insertBefore(refNode: IFabricNode): void {
    // tslint:disable-next-line:no-any
    const children = this.children;
    while (children.length > 0) {
      FabricDOM.insertBefore(children[0], refNode);
    }
    // internally we could generally assume that this is an IRenderLocation,
    // but since this is also public API we still need to double check
    // (or horrible things might happen)
    if (isRenderLocation(refNode)) {
      this.end = refNode;
      const start = this.start = refNode.$start;
      // if (start.$nodes === null) {
      //   start.$nodes = this;
      // } else {
      //   // if more than one NodeSequence uses the same RenderLocation, it's an child
      //   // of a repeater (or something similar) and we shouldn't remove all nodes between
      //   // start - end since that would always remove all items from a repeater, even
      //   // when only one is removed
      //   // so we set $nodes to PLATFORM.emptyObject to 1) tell other sequences that it's
      //   // occupied and 2) prevent start.$nodes === this from ever evaluating to true
      //   // during remove()
      //   start.$nodes = PLATFORM.emptyObject;
      // }
    }
  }
  public appendTo(parent: IFabricNode): void {
    // tslint:disable-next-line:no-any
    // (<any>parent).appendChild(this.fragment);
    // parent.addChild(...this.children);
    // if (this.children.length === 1 && this.children[0].typeName === 'Page') {

    // }
    this.children.forEach(c => FabricDOM.appendChild(c, parent));
    // this can never be a RenderLocation, and if for whatever reason we moved
    // from a RenderLocation to a host, make sure "start" and "end" are null
    this.start = this.end = null;
  }
  public remove(): void {
    // const fragment = this.fragment;
    // if (this.start !== null && this.start.$nodes === this) {
    //   // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
    //   // repeater with a single item) then simply remove everything in-between (but not
    //   // the comments themselves as they belong to the parent)
    //   const end = this.end;
    //   let next: IPixiNode;
    //   let current = this.start.nextSibling;
    //   while (current !== end) {
    //     next = current.nextSibling;
    //     // tslint:disable-next-line:no-any
    //     (<any>fragment).appendChild(current);
    //     current = next;
    //   }
    //   this.start.$nodes = null;
    //   this.start = this.end = null;
    // } else {
    //   // otherwise just remove from first to last child in the regular way
    //   let current = this.firstChild;
    //   if (current.parentNode !== fragment) {
    //     const end = this.lastChild;
    //     let next: INode;
    //     while (current !== null) {
    //       next = current.nextSibling;
    //       // tslint:disable-next-line:no-any
    //       (<any>fragment).appendChild(current);
    //       if (current === end) {
    //         break;
    //       }
    //       current = next;
    //     }
    //   }
    // }
  }
}
export interface IFabricNodeSequenceFactory {
  createNodeSequence(): IFabricNodeSequence;
}
export class FabricNodeSequenceFactory {
  private readonly deepClone: boolean;
  private readonly node: DocumentFragment | Text;
  private readonly Type: Constructable;
  constructor(fragment: DocumentFragment) {
    const childNodes = fragment.childNodes;
    switch (childNodes.length) {
      case 0:
        this.createNodeSequence = () => BlessedNodeSequence.empty;
        return;
      case 2:
        const target = childNodes[0];
        if (target.nodeName === 'AU-MARKER' || target.nodeName === '#comment') {
          const text = childNodes[1];
          if (text.nodeType === NodeTypes.TEXT && text.textContent === ' ') {
            text.textContent = '';
            this.deepClone = false;
            this.node = text as Text;
            this.Type = FabricTextNodeSequence;
            return;
          }
        }
      // falls through if not returned
      default:
        this.deepClone = true;
        this.node = fragment;
        this.Type = FabricFragmentNodeSequence;
    }
  }
  public static createFor(markupOrNode: string | INode): FabricNodeSequenceFactory {
    const fragment = FabricDOM.createDocumentFragment(markupOrNode);
    return new FabricNodeSequenceFactory(fragment);
  }
  public createNodeSequence(): IFabricNodeSequence {
    return new this.Type(this.node);
  }
}
const enum NodeTypes {
  ELEMENT = 1,
  TEXT = 3,
}
function nodeToFabricVNodes(nodes: Node[] | ArrayLike<Node>, parent: IFabricNode = null, targets: IFabricNode[] = []): IFabricNode[] {
  const results: IFabricNode[] = [];
  for (let i = 0, ii = nodes.length; ii > i; ++i) {
    const node = nodes[i];
    let konvaNode: IFabricNode | null = null;
    if (!node.nodeType) {
      throw new Error('No node type????');
    }
    switch (node.nodeType) {
      case NodeTypes.ELEMENT:
        const nodeName = nodes[i].nodeName;
        konvaNode = FabricDOM.createElement(nodeName, node as Element);
        // konvaNode.nodeType = NodeTypes.ELEMENT;
        konvaNode.nodeName = nodeName;
        if ((node as Element).classList.contains('au')) {
          targets.push(konvaNode);
        }
        break;
      // case NodeTypes.TEXT:
      //   nsView = NsDOM.createTextNode(node.textContent);
      //   nsView.nodeName = '#text';
      //   break;
    }
    if (konvaNode === null) {
      continue;
    } else {
      results.push(konvaNode);
    }
    if (parent !== null) {
      FabricDOM.appendChild(konvaNode, parent);
      // parent.addChild(pixiElement);
    }
    if (node.childNodes.length > 0) {
      // if (nsView instanceof PIXI.Container) {
      nodeToFabricVNodes(node.childNodes, konvaNode, targets);
      // } else {
      //   throw new Error(
      //     `Invalid object model. ${node.nodeName.toLowerCase()} is not an instance of PIXI.Container. Cannot have childnodes`
      //   );
      // }
    }
  }
  return results;
}
/*@internal*/
// export class AuMarker extends View implements ILibUiNode {
//   public readonly nodeName: 'au-marker';
//   public readonly nodeType: NodeTypes.ELEMENT;
//   public textContent: string = '';
//   private nextNode: ILibUiNode;
//   constructor(next: ILibUiNode) {
//     super();
//     this.nextNode = next;
//   }
//   public remove(): void { /* do nothing */ }
//   get nextSibling() {
//     return this.nextNode;
//   }
// }
// (proto => {
//   // proto.previousSibling = null;
//   // proto.firstChild = null;
//   // proto.lastChild = null;
//   // proto.children = PLATFORM.emptyArray;
//   proto.nodeName = 'au-marker';
//   proto.nodeType = NodeTypes.ELEMENT;
// })(<Writable<AuMarker>>AuMarker.prototype);