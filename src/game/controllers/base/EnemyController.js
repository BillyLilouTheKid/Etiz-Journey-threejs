import { Vec3, Quaternion } from "cannon-es";

export default class EnemyController {
    constructor(body, speed, target) {
        this.body = body;
        this.speed = speed;
        this.controls = [0,0,0]; // this array represent the x and y axis of moving in an area from -1 to 1 and on index 2 for the jump action
        this.target = target;
    }

    getTargetQuaternionFromTarget() {
        const bodyTarget = this.target.getBody("base")
        const dx = bodyTarget.position.x - this.body.position.x; // we get the x distance between the player position and the entity itself
        const dz = bodyTarget.position.z - this.body.position.z; // we get the z distance between the player position and the entity itself
        const targetAngle = Math.atan2(dx, dz); // we return the angle between the dx and dz

        const targetQuat = new Quaternion();
        targetQuat.setFromAxisAngle(new Vec3(0, 1, 0), targetAngle); // we set the axis angle to the player

        return targetQuat;
    }

    rotateToTarget() {
        const targetQuat = this.getTargetQuaternionFromTarget();
        this.body.quaternion.slerp(targetQuat, 0.1, this.body.quaternion); // we smootly rotate the entity to the player
    }

    lockToTarget() {
       const targetQuat = this.getTargetQuaternionFromTarget();
        this.body.quaternion.copy(targetQuat); // we smootly rotate the entity to the player
    }

    // at every tick, we lock the enemy's rotation to the player
    tick() {
        this.rotateToTarget();
    }
}