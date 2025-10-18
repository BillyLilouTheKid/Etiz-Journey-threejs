import {World, Vec3} from "cannon-es";

function createPhysicSystem({gravity = {x: 0, y: -9.82, z: 0}} = {}) {
    const world = new World({
        gravity: new Vec3(gravity.x, gravity.y, gravity.z), // m/s²
    });

    return world;
}

export {createPhysicSystem};