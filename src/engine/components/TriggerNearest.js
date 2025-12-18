import { Body, Cylinder } from "cannon-es";

export default class TriggerNearest {
    constructor(parent) {
        this.parent = parent;

        const capsuleBody = new Body({
            mass: 0, // kg
            shape: new Cylinder(12,12,0.5,12),
            fixedRotation: true,
            isTrigger: true,
            collisionResponse: false,
            position: this.parent.position,
        }); // the body to represent the trigger box
        this.body = capsuleBody;
        this.currentTargetsInTrigger = new Set();

        // when the trigger body is colliding with an another enemy entity
        this.body.addEventListener("collide", (event) => {
            const other = event.body;
            if (other.entityType == "Sbire" && !this.currentTargetsInTrigger.has(other)) {
                this.currentTargetsInTrigger.add(other); // it add the entity inside the set
            }
        });

        // when the trigger body stop colliding with an another enemy entity
        this.body.addEventListener("collideExit", (event) => {
            const other = event.body;
            if (other.entityType == "Sbire" && this.currentTargetsInTrigger.has(other)) {
                this.currentTargetsInTrigger.delete(other); // it remove the entity from the set
            }
        });
    }

    getBody() {
        return this.body;
    }

    // get the nearest entity from the trigger box
    getNearestTarget() {
        const getDistance = (posA, posB) => {
            let dA = posA.x - posB.x;
            let dB = posA.z - posB.z;
            return Math.hypot(dA, dB);
        }; // to get the distance between two points
        const targets = [...this.currentTargetsInTrigger];
        if (targets.length == 0) return null;
        let nearestTarget = targets[0];
        let nearestDistance = getDistance(this.body.position, targets[0].position);
        for (let i = 1; i < targets.length; i++) {
            const newDistance = getDistance(this.body.position, targets[i].position);
            if (newDistance < nearestDistance) {
                nearestDistance = newDistance;
                nearestTarget = targets[i];
            }
        }
        return nearestTarget;
    }

    // each tick, the trigger box position is set to his parent (the player body)
    tick() {
        this.body.position = this.parent.position;
    }
}