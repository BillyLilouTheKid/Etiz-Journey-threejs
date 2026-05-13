export default class InputSystem {
  /**
     * @param {{ (keyCode: string, isPressed: any): void; (arg0: string, arg1: boolean): void; }} keyEventCallback
     */
  constructor(keyEventCallback) {
        /** @type {Record<string, boolean>} */
        this.keys = {};

        window.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
            if (keyEventCallback) keyEventCallback(e.key, true);
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
            if (keyEventCallback) keyEventCallback(e.key, false);
        });
    }

    /**
     * @param {string | number} keyCode
     */
    isPressed(keyCode) {
        return this.keys[keyCode] === true;
    }

    /**
     * @param {any[]} keyCodeArray
     */
    isFromSetKeys(keyCodeArray) {
        return keyCodeArray.some((/** @type {string | number} */ keyCode)=>this.keys[keyCode] === true);
    }
}
