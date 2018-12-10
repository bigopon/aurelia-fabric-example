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
		<canvas>
			<rect></rect>
		</canvas>
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
		host: ct
	})
	.start();
