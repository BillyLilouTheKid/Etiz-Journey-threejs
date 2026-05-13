import GameObserver from "../../../engine/observer/GameObserver";
import { Body } from "cannon-es";

export default class GameObject {
    #id;
    #objectType;

    /**
     * @param {Object3D} mesh
     * @param {CannonBody} body
     * @param {string} objectType
     */
    constructor(mesh, body, objectType) {
        this.#id = self.crypto.randomUUID(); // add a unique id for each gameobject
        this.#objectType = objectType; // refer the objectType
        this.rootMesh = mesh; // referenced the mesh containing the global hitbox (handled by threejs)
        this.rootMesh.userData.heightOffset = 0;
        /**
         * @type {Object3D | null}
         */
        this.renderMesh = null; // referenced the mesh containing the armature
        this.body = body; // referenced the cannon-es body
        /**@type {AnimationClip[] | null} */
        this.animations = null;
        /**
         * @type {AnimationMixer | null}
         */
        this.mixer = null;
        body.gameObjectID = this.#id;
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
        if (this.body) {
            const body = this.body;
            body.type = Body.KINEMATIC;
            body.velocity.set(0, 0, 0); // we reset any current velocity of the entity
            body.angularVelocity.set(0, 0, 0); // we reset any current angular velocity of the entity
            body.collisionResponse = false;
        }
    }

    // this methode enable the collision and physic of the cannon-es of the gameObject
    enableBodyCollisionAndPhysic() {
        if (this.body) {
            const body = this.body;
            body.type = Body.DYNAMIC;
            body.collisionResponse = true;
        }
    }

    tick() {
        if (this.body) {
            this.rootMesh.position.copy(this.body.position); // make the mesh copy the base body position (not the trigger box)
            this.rootMesh.position.y -= this.rootMesh.userData.heightOffset; // set the Y position of the mesh to be at the center of the body entity
            this.rootMesh.quaternion.copy(this.body.quaternion); // make the mesh copy the base body rotation (not the trigger box)
        }
    }
}