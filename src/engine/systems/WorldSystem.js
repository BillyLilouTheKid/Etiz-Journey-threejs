import GameLoop from "../core/GameLoop";
import CannonDebugger from 'cannon-es-debugger';

class WorldSystem {
    #camera;
    #scene;
    #physic;
    #renderer;
    #gameLoop;
    #cannonDebug;
    constructor(camera, scene, physic, renderer, debug = false) {
        this.#camera = camera;
        this.#scene = scene;
        this.#physic = physic;
        this.#renderer = renderer;
        if (debug) {
            this.#cannonDebug = new CannonDebugger(this.#scene, this.#physic);
        }
        this.#gameLoop = new GameLoop(this.#camera, this.#scene, this.#physic, this.#renderer, this.#cannonDebug);
    }

    addEntity(entity) {
        if (entity.mesh) this.#scene.add(entity.mesh);
        if (entity.bodies) {
            if (typeof entity.bodies == "object") {
                entity.bodies.forEach((body, key) => {
                    this.#physic.addBody(body);
                });
            }
        }
        this.#gameLoop.addUpdatable(entity);
    }

    start() {
        this.#gameLoop.start();
    }
}

export default WorldSystem;