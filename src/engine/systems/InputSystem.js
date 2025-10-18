export default class InputSystem {
  constructor(keyEventCallback) {
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

    isPressed(keyCode) {
        return this.keys[keyCode] === true;
    }

    isFromSetKeys(keyCodeArray) {
        return keyCodeArray.some((keyCode)=>this.keys[keyCode] === true);
    }
}
