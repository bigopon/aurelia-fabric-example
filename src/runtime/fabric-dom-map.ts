// import { CSSStyleDeclaration, Node, Element, HTMLElement } from '../basichtml';
import { FabricDOM } from './fabric-dom';
import { PLATFORM } from '../kernel';
import { VNode } from '../dom/node';

(map => {
  const emptyOps = {};
  const dimensionProps: ('top' | 'left' | 'width' | 'height')[] = ['top', 'left', 'width', 'height'];
  // function transferDimension(opts: Widgets.ElementOptions, node: Element) {
  //   dimensionProps.forEach(prop => {
  //     const value = node.getAttribute(prop);
  //     if (value) {
  //       const num = Number(value);
  //       opts[prop] = num ? num : value;
  //     }
  //   });
  //   return opts;
  // }
  // function transferContent(opts: Widgets.ElementOptions, node: Element) {
  //   ['content', 'text'].forEach(prop => {
  //     const contentOrText = node.getAttribute(prop);
  //     if (contentOrText) {
  //       opts[prop] = contentOrText;
  //     }
  //   });
  //   return opts;
  // }
  // function transferBooleans(opts: Widgets.ElementOptions, node: Element) {
  //   ['keys', 'mouse'].forEach(prop => {
  //     if (node.hasAttribute(prop)) {
  //       opts[prop] = true;
  //     }
  //   });
  //   if (node.hasAttribute('input-on-focus')) {
  //     opts['inputOnFocus'] = true;
  //   }
  //   return opts;
  // }
  // function transferStyles(opts: Widgets.ElementOptions, node: Element) {
  //   const style = (node as HTMLElement).style || (node.getAttributeNode('style') as any as CSSStyleDeclaration);
  //   if (style) {
  //     const optsStyle = opts.style = opts.style || {};
  //     const background = style.bg;
  //     if (background) {
  //       optsStyle.bg = background;
  //     }
  //     const focus = style['bg.focus'];
  //     if (focus) {
  //       optsStyle.focus = { bg: focus };
  //     }
  //     const border = node.getAttribute('border');
  //     if (border && (border === 'line' || border === 'bg')) {
  //       opts.border = border;
  //     }
  //   }
  // }
  // function transferName(opts: Widgets.ElementOptions, node: Element) {
  //   const name = node.getAttribute('name');
  //   if (name) {
  //     opts.name = name;
  //   }
  // }
  // function createOpts(node?: Element, opts: Widgets.ElementOptions = {}): Widgets.ElementOptions {
  //   if (node) {
  //     transferDimension(opts, node);
  //     transferContent(opts, node);
  //     transferBooleans(opts, node);
  //     transferStyles(opts, node);
  //     transferName(opts, node);
  //   }
  //   return opts;
  // }
  const camelCase = PLATFORM.camelCase;
  // map('')?
  VNode.invokeNativeObject = (node: VNode<fabric.Object | fabric.StaticCanvas>, ...args: any[]) => {
    const nodeName = node.nodeName;
    switch (nodeName) {
      case 'canvas':
        let canvas: HTMLCanvasElement;
        if (node.hasAttribute('canvas')) {
          let canvasId =  node.getAttribute('canvas');
          canvas = document.getElementById(canvasId) as HTMLCanvasElement;
          if (canvas === null) {
            throw new Error('Invalid canvas ID. Canvas not found');
          }
        } else {
          canvas = document.createElement('canvas');
        }
        node.nativeObject = new fabric.Canvas(canvas, node.attributes);
      case '':
    }
  };
  VNode.appendChild = (node: VNode<fabric.Object | fabric.StaticCanvas>, parentNode: VNode) => {
    const nodeName = node.nodeName;
    const nodeNativeObject = node.nativeObject;
    const parentNodeName = parentNode.nodeName;
    const parentNativeObject = parentNode.nativeObject;
    
    if (parentNodeName === '$root') {
      if (nodeName === 'canvas' || nodeName === 'static-canvas') {
        (parentNativeObject as HTMLElement).appendChild((nodeNativeObject as fabric.StaticCanvas).getElement());
      } else {
        throw new Error(`Invalid root node child. Expected "canvas" or "static-canvas", received: "${nodeName}"`);
      }
      return;
    }

    if (!(nodeNativeObject instanceof fabric.Object)) {
      throw new Error(`Invalid child node. Expected a fabric.Object instance. Received : "${nodeNativeObject.constructor.name}"`);
    }

    if (parentNodeName === 'canvas' || parentNodeName === 'static-canvas') {
      (parentNativeObject as fabric.StaticCanvas).add(nodeNativeObject);
      return;
    }
    if (parentNodeName === 'group') {
      (parentNativeObject as fabric.Group).add(nodeNativeObject);
    }
  };
})(FabricDOM.map);
