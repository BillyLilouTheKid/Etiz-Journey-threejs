import {Camera, Clock, Scene} from "three";

export default class GameLoop {
    #camera;
    #scene;
    #renderer;
    #physic;
    #cannonDebugMode;
    #updatables;
    /**
     * @param {Camera} camera
     * @param {Scene} scene
     * @param {any} physic
     * @param {any} renderer
     * @param {any} cannonDebugMode
     */
    constructor(camera, scene, physic, renderer, cannonDebugMode) {
        this.#camera = camera;
        this.#scene = scene;
        this.#physic = physic;
        this.#renderer = renderer;
        this.#cannonDebugMode = cannonDebugMode;
        this.#updatables = new Set(); // set of all the objects that contain a "tick" method
    }

    // add a new updatable object to the set
    /**
     * @param {any} obj
     */
    addUpdatable(obj) {
        this.#updatables.add(obj);
    }

    // delete a updatable object from the set
    /**
     * @param {any} obj
     */
    deleteUpdatable(obj) {
        this.#updatables.delete(obj);
    }

    start() {
        const clock = new Clock();
        const animate = () => {

            const delta = clock.getDelta();
            // 1. update all the objecs
            this.#updatables.forEach(obj => {
                if (obj.tick) obj.tick(delta);
            });

            this.#physic.fixedStep();

            // 2. render the scene
            this.#renderer.render(this.#scene, this.#camera);

            // 3. relaunch the next animation frame
            requestAnimationFrame(animate);

            if (this.#cannonDebugMode) this.#cannonDebugMode.update();
        };

        requestAnimationFrame(animate);
    }
}