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
    #onDebugMode
    #cannonDebug
    /**
     * @param {import("three").PerspectiveCamera} camera
     * @param {import("three").Scene<import("three").Object3DEventMap>} scene
     * @param {import("world/World").World} physic
     * @param {import("three").WebGLRenderer} renderer
     */
    constructor(camera, scene, physic, renderer, debug = false) {
        this.#id = self.crypto.randomUUID();
        this.#camera = camera;
        this.#scene = scene;
        this.#physic = physic;
        this.#renderer = renderer;
        this.#onDebugMode = debug;
        if (debug) this.#cannonDebug = CannonDebugger(this.#scene, this.#physic);
        this.#gameLoop = new GameLoop(this.#camera, this.#scene, this.#physic, this.#renderer, this.#cannonDebug);
        GameObserver.setWorldSystem(this);
    }

    getId() {
        return this.#id;
    }

    getObjectType() {
        return ObserverObjectEnum.World;
    }

    getOnDebugMode() {
        return this.#onDebugMode;
    }

    /**
     * @param {GameObject} gameObject
     */
    // add a GameObject to the world
    addGameObject(gameObject) {
        if (gameObject.rootMesh) this.#scene.add(gameObject.rootMesh);
        if (gameObject.body) {
            if (typeof gameObject.body == "object") {
                this.#physic.addBody(gameObject.body);
            }
        }
        this.#gameLoop.addUpdatable(gameObject);
    }

    /**
     * @param {GameObject} gameObject
     */
    removeGameObject(gameObject) {
        // 1. Scene
        if (gameObject.rootMesh) {
            this.#scene.remove(gameObject.rootMesh);

            gameObject.rootMesh.traverse((child) => {
                if ("isMesh" in child) {
                    const mesh = /** @type {Mesh} */ (child);
                    mesh.geometry?.dispose?.();
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose?.());
                    } else {
                        mesh.material?.dispose?.();
                    }
                }
            });
        }

        // 2. Physics
        if (gameObject.body) {
            this.#physic.removeBody(gameObject.body);
            gameObject.body.velocity?.set(0, 0, 0);
            gameObject.body.angularVelocity?.set(0, 0, 0);
        }

        // 3. Loop
        this.#gameLoop.deleteUpdatable(gameObject);

        // 4. Animation cleanup
        gameObject.mixer?.stopAllAction?.();
    }

    start() {
        this.#gameLoop.start();
    }
}

export default WorldSystem;