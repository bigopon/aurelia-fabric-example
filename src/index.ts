/// <reference types="fabric" />
import 'reflect-metadata';
// import { init, Element, HTMLElement } from './basichtml';
import { DOM, Aurelia } from './runtime';
import { observable } from './observable';

// const doc = init().document;
// DOM.setHtmlReference(doc as any, Element as any, HTMLElement as any, class SVGElement_ {} as any);

import { BasicConfiguration } from './jit';

import { customElement } from './runtime';

const ct = document.body.appendChild(document.createElement('div'));
Object.assign(ct.style,  {
	width: '650px',
	height: '450px',
	border: '1px solid blue',
	background: '#f2f2f2'
});

function renderCanvas(canvas1: fabric.Canvas, canvas2: fabric.Canvas, canvas3, canvas4) {
	canvas1.renderAll();
	canvas2.renderAll();
	canvas3.renderAll();
	canvas4.renderAll();
}

@customElement({
  name: 'app',
  template: /*html*/ `
	<template>
		<canvas width="300" height="200" background-color="#c3c3c3" ref="canvas1">
			<rect stroke="red" fill="blue" width="50" height="50" top.two-way="x" left.two-way="y"></rect>
		</canvas>
		<canvas y="250" width="300" height="200" background-color="#35a3f2" ref="canvas2">
			<rect stroke="red" fill="green" width="75" height="75" top.two-way="x" left.two-way="y"></rect>
		</canvas>
		<canvas x="350" width="300" height="200" background-color="lightpink" ref="canvas3">
			<rect stroke="red" fill="magneto" width="40" height="85" top.two-way="x" left.two-way="y"></rect>
		</canvas>
		<canvas x="350" y="250" width="300" height="200" background-color="#ffde03" ref="canvas4">
			<rect stroke="darkgreen" fill="orangered" width="80" height="40" top.two-way="x" left.two-way="y"></rect>
		</canvas>
  </template>`
})
export class App {

	@observable({ changeHandler: 'renderCanvas' })
	x = 10;

	@observable({ changeHandler: 'renderCanvas' })
	y = 10;

	canvas1: fabric.Canvas;
	canvas2: fabric.Canvas;
	canvas3: fabric.Canvas;
	canvas4: fabric.Canvas;

  constructor() {
		window['app'] = this;
	}

	attached() {
		this.renderCanvas();
	}

	/**
	 * To update all canvas at the same times
	 * fabric only rerender when it's interacted with, or explicitly called
	 */
	renderCanvas() {
		if (this.canvas1) {
			setTimeout(renderCanvas, 20, this.canvas1, this.canvas2, this.canvas3, this.canvas4);
		}
	}
}

window['au'] = new Aurelia()
	.register(
		BasicConfiguration,
	)
	.app({
		component: App,
		host: ct
	})
	.start();
