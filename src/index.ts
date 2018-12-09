/// <reference types="fabric" />
import 'reflect-metadata';
// import { init, Element, HTMLElement } from './basichtml';
import { DOM, Aurelia } from './runtime';

// const doc = init().document;
// DOM.setHtmlReference(doc as any, Element as any, HTMLElement as any, class SVGElement_ {} as any);

import { BasicConfiguration } from './jit';

import { customElement } from './runtime';

@customElement({
  name: 'app',
  template: 
	`<template>
		<layer>
			<rect draggable x.two-way="rectX" y.two-way="rectY" width="100" height="100" fill="grey"></rect>
			<rect x.bind="rectX + 150" y.bind="rectY + 100" width="50" height="50" fill="red"></rect>
			<rect x.bind="-rectX + 750" y.bind="-rectY + 550" width="50" height="50" fill="green"></rect>
		</layer>
  </template>`
})
export class App {

	rectX = 10;
	rectY = 10;

  constructor() {
		window['app'] = this;
	}
}

const ct = document.body.appendChild(document.createElement('div'));
Object.assign(ct.style,  {
	width: '800px',
	height: '600px',
	backgroundColor: 'rgba(224,224,224, 0.8)'
});

window['au'] = new Aurelia()
	.register(
		// DebugConfiguration,
		BasicConfiguration,
	)
	.app({
		component: App,
		stage: {
			container: ct,
			width: 800,
			height: 600
		}
	})
	.start();
