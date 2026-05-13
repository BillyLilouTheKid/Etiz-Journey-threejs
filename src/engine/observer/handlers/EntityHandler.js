// this channel handle the actions for the entities
export default class EntityHandler {
    /**
     * @param {Set<WorldSystem>} worldSystem
     * @param {Map<string, Entity>} entities
     */
    constructor(worldSystem, entities) {
        this.worldSystem = worldSystem;
        this.entities = entities;
    }

    // add an array of entities into the map
    /**
     * @param {Entity[]} entities
     */
    addEntitiesToScene(entities) {
        entities.forEach((element) => {
            this.entities.set(element.getId(), element);
        });
    }

    // delete the entity from the scene and the entities map
    /**
     * @param {Entity} entity
     */
    killEntity(entity) {
        const [world] = this.worldSystem;
        world.removeGameObject(entity); // remove the entity from the world
        this.entities.delete(entity.getId()); // remove the entity from the map
    }

    // return the closest entity from the parameter entity
    /**
     * @param {Entity} entity
     * @return {Entity | null}
     */
    findClosestEntityTo(entity, maxDistanceFilter = 0) {
        let closest = Infinity;
        /**@type {Entity | null} */
        let result = null;
        // for each entities
        this.entities.forEach((/** @type {Entity} */ otherEntity) => {
            // if the entity is not the same as the one inside the parameter
            if (otherEntity !== entity) {
                // we get the distance between the parameter entity and the other entity
                const distance = entity.rootMesh.position.distanceToSquared(otherEntity.rootMesh.position);
                // if it's closer than we update the variables
                if (distance <= maxDistanceFilter && distance < closest) {
                    closest = distance;
                    result = otherEntity;
                }
            }
        })

        return result;
    }
}