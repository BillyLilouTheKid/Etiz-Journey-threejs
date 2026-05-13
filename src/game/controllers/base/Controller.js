import { Vec3, Quaternion } from "cannon-es";
import { EntityStatut } from "../../../types/enums";

export default class Controller {
    /**
     * @param {CannonBody} body
     * @param {number} speed
     */
    constructor(body, speed) {
        /** @type {CannonBody} */
        this.body = body;
        /** @type {number} */
        this.speed = speed;
        /** @type {number[]} */
        this.controls = [0,0,0,0]; // this array represent the x and y axis of moving in an area from -1 to 1 and on index 2 for the jump action and on index 3 for the lock mode
        /** @type {Entity | null} */
        this.target = null;
        /** @type {Entity | null} */
        this.rootEntity = null;
        /** @type {Entity | null} */
        this.carriedEntity = null;
    }

    // this function allows to lift an gameObject
    /**
     * @param {Entity} entity
     */
    liftEntity(entity) {
        entity.statut = EntityStatut.Lifted;
        entity.disableBodyCollisionAndPhysic();
        this.carriedEntity = entity;
    }

    // this function will set the position and quaternion (rotation) of an entity on top of the current entity head
    carryEntity() {
        if (!this.rootEntity || !this.carriedEntity) return;
        const playerBody = this.rootEntity.body;
        const body = this.carriedEntity.body;


        // we create a local vector with a bit of height (3) and a bit forward (1.5)
        const frontVec = new Vec3(0, 3, 1.5);

        // we transform the frontVec depending of the player rotation
        const worldFront = new Vec3();
        playerBody.quaternion.vmult(frontVec, worldFront);

        body.position.copy(playerBody.position); // we copy the player position into the carried entity position
        body.position.vadd(worldFront, body.position); // we add to the carried entity position the worldFront

        const opposite = new Quaternion();
        opposite.setFromAxisAngle(new Vec3(0, 1, 0), Math.PI); // we create a new quaternion that is 180° degree of the y axis

        body.quaternion.copy(this.rootEntity.body.quaternion); // we copy the rotation of the player into the carried entity
        body.quaternion.mult(opposite, body.quaternion); // then we make it rotate to the opposite no matter the rotation of the player thank to the 180 degree quaternion
    }

    // this function allow to throw an entity at the direction the player is aiming
    thrownEntity() {
        if (!this.rootEntity || !this.carriedEntity) return;
        const playerBody = this.rootEntity.body;
        const enemyBody = this.carriedEntity.body;

        this.carriedEntity.statut = EntityStatut.Throwed;

        const opposite = new Quaternion();
        opposite.setFromAxisAngle(new Vec3(0, 1, 0), Math.PI); // we set a quaternion to make a rotation of 180 degree

        // we create a new vector that is a bit tall (0.5) and forward (1) as the position where the carried entity will start being thrown
        const forward = new Vec3(0, 0.5, 1);
        playerBody.quaternion.vmult(forward, forward);

        // we then scale the forward vec as a new spawnOffset
        const spawnOffset = forward.scale(2);
        const spawnPosition = playerBody.position.vadd(spawnOffset);

        enemyBody.position.copy(spawnPosition); // we set the enemy position into the spawnPosition

        enemyBody.quaternion.mult(opposite, enemyBody.quaternion);  // we set the rotation of the carried entity to go forward with a 180 degree turn

        // we enable the physics and collision of the carried entity
        this.carriedEntity.enableBodyCollisionAndPhysic();

        // we apply som impulse to the carried entity
        const impulse = forward.scale(200);
        impulse.y = 5;
        enemyBody.applyImpulse(impulse);

        this.carriedEntity = null;
    }

}