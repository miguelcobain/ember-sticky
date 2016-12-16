import scheduler from './raf-scheduler';
import SUPPORTS_PASSIVE from './supports-passive';
export { default as Container } from './container';

const DEFAULT_ARRAY_SIZE = 10;
const UNDEFINED_VALUE = Object.create(null);

export class ScrollHandler {
  constructor() {
    this.elements = new Array(DEFAULT_ARRAY_SIZE);
    this.maxLength = DEFAULT_ARRAY_SIZE;
    this.length = 0;
    this.handlers = new Array(DEFAULT_ARRAY_SIZE);
    this.isPolling = false;
    this.isUsingPassive = SUPPORTS_PASSIVE;
  }

  addScrollHandler(element, handler) {
    let index = this.elements.indexOf(element);
    let handlers;
    let cache;

    if (index === -1) {
      index = this.length++;

      if (index === this.maxLength) {
        this.maxLength *= 2;
        this.elements.length = this.maxLength;
        this.handlers.length = this.maxLength;
      }

      handlers = [handler];

      this.elements[index] = element;
      cache = this.handlers[index] =  {
        top: UNDEFINED_VALUE,
        left: UNDEFINED_VALUE,
        handlers,
        passiveHandler: SUPPORTS_PASSIVE ? function() {
          let top = element.top;
          let left = element.left;
          for (let j = 0; j < handlers.length; j++) {
            handlers[j]({ top, left });
          }
        } : UNDEFINED_VALUE
      };
    } else {
      cache = this.handlers[index];
      handlers = cache.handlers;
      handlers.push(handler);
    }

    if (this.isUsingPassive && handlers.length === 1) {
      element.addEventListener('scroll', cache.passiveHandler, { capture: true, passive: true });
    } else if (!this.isPolling) {
      this.poll();
    }
  }

  removeScrollHandler(element, handler) {
    let index = this.elements.indexOf(element);
    let elementCache = this.handlers[index];

    if (elementCache && elementCache.handlers) {
      let index = elementCache.handlers.indexOf(handler);

      if (index === -1) {
        throw new Error('Attempted to remove an unknown handler');
      }

      elementCache.handlers.splice(index, 1);

      // cleanup element entirely if needed
      if (!elementCache.handlers.length) {
        this.handlers.splice(index, 1);

        index = this.elements.indexOf(element);
        this.elements.splice(index, 1);
        this.length--;
        this.maxLength--;

        if (this.length === 0) {
          this.isPolling = false;
        }

        if (this.isUsingPassive) {
          element.removeEventListener('scroll', elementCache.passiveHandler, {capture: true, passive: true});
        }
      }

    } else {
      throw new Error('Attempted to remove a handler from an unknown element or an element with no handlers');
    }
  }

  poll() {
    this.isPolling = true;

    scheduler.schedule('sync', () => {
      if (!this.isPolling) {
        return;
      }

      for (let i = 0; i < this.length; i++) {
        let element = this.elements[i];
        let info = this.handlers[i];
        let cachedTop = element.scrollTop;
        let cachedLeft = element.scrollLeft;
        let topChanged = cachedTop !== info.top && info.top !== UNDEFINED_VALUE;
        let leftChanged = cachedLeft !== info.left && info.left !== UNDEFINED_VALUE;

        info.top = cachedTop;
        info.left = cachedLeft;

        if (topChanged || leftChanged) {
          for (let j = 0; j < info.handlers.length; j++) {
            info.handlers[j].call(null, { top: info.top, left: info.left });
          }
        }
      }

      this.isPolling = this.length > 0;
      if (this.isPolling) {
        this.poll();
      }
    });
  }
}

const instance = new ScrollHandler();

export function addScrollHandler(element, handler) {
  instance.addScrollHandler(element, handler);
}

export function removeScrollHandler(element, handler) {
  instance.removeScrollHandler(element, handler);
}

export default instance;