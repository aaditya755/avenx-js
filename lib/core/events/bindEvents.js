/**
 * Responsible for binding event listeners to DOM elements based on attributes.
 */
export class EventBinder {
    /**
     * Stores bound events and handlers.
     * @type {WeakMap<Element, Map<string, Function>>}
     * @private
     */
    #boundEvents = new WeakMap();

    /**
     * Binds event listeners to all elements under the root that have attributes starting with '@'.
     * @param {Element|DocumentFragment} root - The root element to scan for event attributes.
     * @param {Object} dispatcher - The object responsible for executing the event handler.
     * @param {function(string, Event): void} dispatcher.execute - Method to execute the event.
     */
    bind(root, dispatcher) {
        if (!root) return;
        const elements = [root];
        if (typeof root.querySelectorAll === 'function') {
            elements.push(...root.querySelectorAll('*'));
        }

        elements.forEach(el => {
            if (el.nodeType !== 1) return; // 1 is Node.ELEMENT_NODE
            if (!el.attributes) return;
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('@')) {
                    const eventName = attr.name.substring(1);
                    const signature = `${eventName}:${attr.value}`;
                    const existing = this.#boundEvents.get(el) || new Map();

                    if (!existing.has(signature)) {
                        const handler = event => dispatcher.execute(attr.value, event);

                        el.addEventListener(eventName, handler);

                        existing.set(signature, handler);
                        this.#boundEvents.set(el, existing);
                    }
                }
            });
        });
    }

    /**
     * Removes all tracked event listeners under a root element.
     * @param {Element|DocumentFragment} root
     */
    unbind(root) {
        if (!root) return;

        const elements = [root];

        if (typeof root.querySelectorAll === 'function') {
            elements.push(...root.querySelectorAll('*'));
        }

        elements.forEach(el => {
            const existing = this.#boundEvents.get(el);

            if (!existing) return;

            existing.forEach((handler, signature) => {
                const eventName = signature.split(':')[0];
                el.removeEventListener(eventName, handler);
            });

            this.#boundEvents.delete(el);
        });
    }
}
