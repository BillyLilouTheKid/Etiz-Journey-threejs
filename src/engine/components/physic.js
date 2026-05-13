import {World, Vec3} from "cannon-es";

/**
 * Create a World.
 *
 * @param {Object} [options={}]
 * @param {{x:number, y:number, z:number}} [options.gravity={x: 0, y: -9.82, z: 0}]
 * @returns {World}
 */
function createPhysicSystem({gravity = {x: 0, y: -9.82, z: 0}} = {}) {
    const world = new World({
        gravity: new Vec3(gravity.x, gravity.y, gravity.z), // m/s²
    });

    return world;
}

export {createPhysicSystem};