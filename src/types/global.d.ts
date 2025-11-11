/**
 * Declaraciones de tipos globales para resolver errores del IDE WindSurf
 * Versión: 3.6.3
 * Fecha: 11 Nov 2025
 */

// Declaraciones globales para el entorno del navegador
declare global {
  // Variables globales del navegador
  const window: Window & typeof globalThis;
  const document: Document;
  const navigator: Navigator;
  const console: Console;
  const setTimeout: (callback: () => void, delay: number) => number;
  const performance: Performance;

  // Interfaces del DOM
  interface Window {
    addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void;
    location: Location;
    fetch: typeof fetch;
    PerformanceObserver: typeof PerformanceObserver;
    performance: Performance;
    getComputedStyle: (element: Element) => CSSStyleDeclaration;
  }

  interface Document {
    addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void;
    querySelector(selectors: string): Element | null;
    getElementById(elementId: string): HTMLElement | null;
    createElement(tagName: string): HTMLElement;
    styleSheets: StyleSheetList;
    readyState: DocumentReadyState;
    body: HTMLElement;
    fonts?: any;
  }

  interface Navigator {
    userAgent: string;
    clipboard?: {
      writeText: (text: string) => Promise<void>;
    };
  }

  // Elementos HTML con propiedades correctas
  interface HTMLElement {
    tagName: string;
    innerHTML: string;
    textContent: string | null;
    style: CSSStyleDeclaration;
    onclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
    firstChild: ChildNode | null;
    hasChildNodes(): boolean;
    removeChild(child: Node): Node;
    appendChild(newChild: Node): Node;
  }

  interface HTMLLinkElement extends HTMLElement {
    href: string;
  }

  interface HTMLScriptElement extends HTMLElement {
    src: string;
  }

  interface HTMLImageElement extends HTMLElement {
    src: string;
  }

  // Eventos del navegador
  interface ErrorEvent extends Event {
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: Error;
  }

  interface PromiseRejectionEvent extends Event {
    reason: any;
  }

  // Performance API
  interface PerformanceResourceTiming extends PerformanceEntry {
    transferSize: number;
    decodedBodySize: number;
    duration: number;
    name: string;
  }

  // CSS Style Declaration
  interface CSSStyleDeclaration {
    fontFamily: string;
    backgroundColor: string;
    color: string;
    [key: string]: string;
  }
}

// Tipos específicos para React eventos
declare module 'react' {
  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
}

export {};
