import {Clock} from "three";

export default class GameLoop {
    #camera;
    #scene;
    #renderer;
    #physic;
    #updatables;
    constructor(camera, scene, physic, renderer) {
        this.#camera = camera;
        this.#scene = scene;
        this.#physic = physic;
        this.#renderer = renderer;
        this.#updatables = []; // liste des objets qui ont une méthode "tick"
    }

    // Ajoute un objet à mettre à jour chaque frame
    addUpdatable(obj) {
        this.#updatables.push(obj);
    }

    start() {
        const clock = new Clock();
        const animate = (time) => {

            const delta = clock.getDelta();
            // 1. update tous les objets
            this.#updatables.forEach(obj => {
                if (obj.tick) obj.tick(delta);
            });

            this.#physic.fixedStep();

            // 2. render la scène
            this.#renderer.render(this.#scene, this.#camera);

            // 3. relance la frame suivante
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}