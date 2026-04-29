import { ObserverObjectEnum } from "../../../types/enums";

// this channel handle the action of player
export default class PlayerEventHandler {
    constructor(entities) {
        this.entities = entities;
    }

    // retrieve the player from the map of entities
    getPlayerEntityFromSet() {
       for (const entity of this.entities.values()) {
            if (entity.getObjectType() === ObserverObjectEnum.Player) {
                this.player = entity;
                return entity;
            }
        }
    }
}