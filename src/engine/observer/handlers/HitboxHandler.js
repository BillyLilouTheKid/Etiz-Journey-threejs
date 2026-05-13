import { Box3 } from "three";
import { EntityStatut } from "../../../types/enums";

// this channel handle the actions for the hitbox
export default class HitboxHandler {
    /**
     * @param {Map<any, any>} entities
     * @param {Map<any, any>} props
     */
    constructor(entities, props) {
        this.entities = entities;
        this.props = props;
    }

    // this method allow to fire an attack into an other entity
    /**
     * @param {{ boxMesh: import("three").Object3D<import("three").Object3DEventMap>; owner: { getId: () => any; }; }} hitbox
     * @param {any} damageData
     */
    fire(hitbox, damageData) {
        // we get the active hitbox of the hitbox
        const activeHitbox = new Box3().setFromObject(hitbox.boxMesh);
        // for all existing entities
        for(const entity of this.entities.values()) {
            if (entity.getId() === hitbox.owner.getId()) continue; // if it is the same hitbox as the parameter then we pass
            const objectHitbox = new Box3().setFromObject(entity.passiveHitbox.boxMesh); // we retrieve the hitbox from the entity
            // if the entity hitbox intersect the parameter hitbox then 
            if (activeHitbox.intersectsBox(objectHitbox)) {
                entity.onHit(damageData); // we call the onHit method of the entity
                return;
            }
        }
    }

    // return the entity that intersect the hitbox parameter
    /**
     * @param {{ boxMesh: import("three").Object3D<import("three").Object3DEventMap>; owner: { getId: () => any; }; }} hitbox
     */
    returnIntersectEntity(hitbox) {
        // we get the active hitbox of the hitbox
        const activeHitbox = new Box3().setFromObject(hitbox.boxMesh);
        // for all existing entities
        for (const entity of this.entities.values()) {
            if (entity.getId() === hitbox.owner.getId()) continue; // if it is the same hitbox as the parameter then we pass
            const objectHitbox = new Box3().setFromObject(entity.passiveHitbox.boxMesh); // we retrieve the hitbox from the entity
            // if the entity hitbox intersect the parameter hitbox then 
            if (activeHitbox.intersectsBox(objectHitbox) && entity.statut === EntityStatut.Stunned) {
                return entity;
            }
        }
        return null;
    }
}