import { Color } from "three";
import { createCamera } from "../../engine/components/camera";
import { createScene } from "../../engine/components/scene";
import { createRenderer } from "../../engine/core/renderer";
import { createLights } from "../../engine/components/light";
import { Resizer } from "../../engine/core/Resizer";
import Platform from "../models/props/Platform";
import { createPhysicSystem } from "../../engine/components/physic";
import WorldSystem from "../../engine/systems/worldSystem";
import Etiz from "../entities/characters/Etiz";
import Sbire from "../entities/characters/Sbire";
import { Vec3 } from "cannon-es";

export default class TestMap {

    #camera;
    #scene;
    #physic;
    #renderer;
    #worldSystem
    constructor(container) {
        this.#camera = createCamera({fov: 35, aspect: 1, near: 0.1, far: 100, position: {x:0, y:8, z:30}, rotation: {x:0, y:0, z:0}});
        this.#scene = createScene({color: new Color("#EDE8D0")});
        this.#physic = createPhysicSystem({gravity: {x: 0, y: -9.82, z: 0}});
        this.#renderer = createRenderer();
        container.append(this.#renderer.domElement);
        this.#worldSystem = new WorldSystem(this.#camera, this.#scene, this.#physic, this.#renderer, true);

        const light = createLights();
        this.#scene.add(light);

        // Create a static plane for the ground
        const ground = new Platform();
        this.#worldSystem.addEntity(ground);

        const player = new Etiz(new Vec3(0,5,-3));
        this.#worldSystem.addEntity(player);

        const sbires = [
            // new Sbire(player.getBody("base"), new Vec3(-10,5,-13)),
            new Sbire(player.getBody("base"), new Vec3(-6,5,-3)),
            // new Sbire(player.getBody("base"), new Vec3(-10,5,3)),
        ];
        sbires.forEach((enemy)=>{
            this.#worldSystem.addEntity(enemy);
        })
        

        // Resizer
        const resizer = new Resizer(container, this.#camera, this.#renderer);
            resizer.onResize = () => {
            this.render();
        };
    }

    start() {
        this.#worldSystem.start();
    }

    render() {
        this.#renderer.render(this.#scene, this.#camera);
    }
}