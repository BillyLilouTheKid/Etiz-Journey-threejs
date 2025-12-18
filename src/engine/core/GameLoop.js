import {Clock} from "three";

export default class GameLoop {
    #camera;
    #scene;
    #renderer;
    #physic;
    #debugMode;
    #updatables;
    constructor(camera, scene, physic, renderer, debugMode) {
        this.#camera = camera;
        this.#scene = scene;
        this.#physic = physic;
        this.#renderer = renderer;
        this.#debugMode = debugMode;
        this.#updatables = []; // array of all the objects that contain a "tick" method
    }

    // add a new updatable object to the array
    addUpdatable(obj) {
        this.#updatables.push(obj);
    }

    start() {
        const clock = new Clock();
        const animate = (time) => {

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

            if (this.#debugMode) this.#debugMode.update();
        };

        requestAnimationFrame(animate);
    }
}