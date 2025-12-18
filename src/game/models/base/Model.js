export default class Model {

    constructor(mesh, body) {
        this.mesh = mesh;
        this.bodies = new Map();
        this.bodies.set("base",body);
    }

    getBody(key) {
        return this.bodies.get(key);
    }

    tick() {
        this.mesh.position.copy(this.bodies.get("base").position)
        this.mesh.quaternion.copy(this.bodies.get("base").quaternion)
    }

}