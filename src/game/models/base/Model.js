export default class Model {

    constructor(mesh, body) {
        this.mesh = mesh;
        this.body = body;
    }

    tick() {
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)
    }

}