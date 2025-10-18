import GameLoop from "../core/GameLoop";


class WorldSystem {
    #camera;
    #scene;
    #physic;
    #renderer;
    #gameLoop;
    constructor(camera, scene, physic, renderer) {
        this.#camera = camera;
        this.#scene = scene;
        this.#physic = physic;
        this.#renderer = renderer;
        this.#gameLoop = new GameLoop(this.#camera, this.#scene, this.#physic, this.#renderer);
    }

    addEntity(entity) {
        if (entity.mesh) this.#scene.add(entity.mesh);
        if (entity.body) this.#physic.addBody(entity.body);
        this.#gameLoop.addUpdatable(entity);
    }

    start() {
        this.#gameLoop.start();
    }
}

export default WorldSystem;