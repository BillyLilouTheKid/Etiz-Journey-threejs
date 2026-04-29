import GameObserver from "../../../engine/observer/GameObserver";
import { Body } from "cannon-es";

export default class GameObject {
    #id;
    #objectType;

    constructor(mesh, body, objectType) {
        this.#id = self.crypto.randomUUID(); // add a unique id for each gameobject
        this.#objectType = objectType; // refer the objectType
        this.rootMesh = mesh; // referenced the mesh containing the global hitbox (handled by threejs)
        this.rootMesh.userData.heightOffset = 0;
        this.renderMesh = null; // referenced the mesh containing the armature
        this.bodies = new Map(); // referenced the cannon-es body
        body.gameObjectID = this.#id;
        this.bodies.set("base", body);
        GameObserver.subscribe(this); // subscribe to the GameObserver
    }

    getId() {
        return this.#id;
    }

    getObjectType() {
        return this.#objectType;
    }

    // this methode disable the collision and physic of the cannon-es body of the gameObject
    disableBodyCollisionAndPhysic() {
        const body = this.bodies.get("base");
        body.type = Body.KINEMATIC;
        body.velocity.set(0, 0, 0); // we reset any current velocity of the entity
        body.angularVelocity.set(0, 0, 0); // we reset any current angular velocity of the entity
        body.collisionResponse = false;
    }

    // this methode enable the collision and physic of the cannon-es of the gameObject
    enableBodyCollisionAndPhysic() {
        const body = this.bodies.get("base");
        body.type = Body.DYNAMIC;
        body.collisionResponse = true;
    }

    tick() {
        this.rootMesh.position.copy(this.bodies.get("base").position); // make the mesh copy the base body position (not the trigger box)
        this.rootMesh.position.y -= this.rootMesh.userData.heightOffset; // set the Y position of the mesh to be at the center of the body entity
        this.rootMesh.quaternion.copy(this.bodies.get("base").quaternion); // make the mesh copy the base body rotation (not the trigger box)
    }
}