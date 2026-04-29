import GameLoop from "../core/GameLoop";
import CannonDebugger from 'cannon-es-debugger';
import GameObserver from "../observer/GameObserver";
import { ObserverObjectEnum } from "../../types/enums";

class WorldSystem {
    #id;
    #camera;
    #scene;
    #physic;
    #renderer;
    #gameLoop;
    #cannonDebug;
    constructor(camera, scene, physic, renderer, debug = false) {
        this.#id = self.crypto.randomUUID();
        this.#camera = camera;
        this.#scene = scene;
        this.#physic = physic;
        this.#renderer = renderer;
        if (debug) {
            this.#cannonDebug = new CannonDebugger(this.#scene, this.#physic);
        }
        this.#gameLoop = new GameLoop(this.#camera, this.#scene, this.#physic, this.#renderer, this.#cannonDebug);
        GameObserver.setWorldSystem(this);
    }

    getId() {
        return this.#id;
    }

    getObjectType() {
        return ObserverObjectEnum.World;
    }

    addEntity(entity) {
        if (entity.rootMesh) this.#scene.add(entity.rootMesh);
        if (entity.bodies) {
            if (typeof entity.bodies == "object") {
                entity.bodies.forEach((body, key) => {
                    this.#physic.addBody(body);
                });
            }
        }
        this.#gameLoop.addUpdatable(entity);
    }

    removeEntity(entity) {
        if (entity.rootMesh) this.#scene.remove(entity.rootMesh);
        if (entity.bodies) {
            if (typeof entity.bodies == "object") {
                entity.bodies.forEach((body, key) => {
                    this.#physic.removeBody(body);
                });
            }
        }
        this.#gameLoop.deleteUpdatable(entity);
    }

    start() {
        this.#gameLoop.start();
    }
}

export default WorldSystem;