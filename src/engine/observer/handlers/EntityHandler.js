
// this channel handle the actions for the entities
export default class EntityHandler {
    constructor(worldSystem, entities) {
        this.worldSystem = worldSystem;
        this.entities = entities;
    }

    // add an array of entities into the map
    addEntitiesToScene(entities) {
        entities.array.forEach(element => {
            this.entities.add(element);
        });
    }

    // delete the entity from the scene and the entities map
    killEntity(entity) {
        const [world] = this.worldSystem;
        world.removeEntity(entity); // remove the entity from the world
        this.entities.delete(entity.getId()); // remove the entity from the map
    }

    // return the closest entity from the parameter entity
    findClosestEntityTo(entity, maxDistanceFilter = 0) {
        let closest = Infinity;
        let result = null;
        // for each entities
        this.entities.forEach(otherEntity => {
            // if the entity is not the same as the one inside the parameter
            if (otherEntity !== entity) {
                // we get the distance between the parameter entity and the other entity
                const distance = entity.rootMesh.position.distanceToSquared(otherEntity.rootMesh.position);
                // if it's closer than we update the variables
                if (distance <= maxDistanceFilter && distance < closest) {
                    closest = distance;
                    result = otherEntity.rootMesh;
                }
            }
        })

        return result;
    }
}