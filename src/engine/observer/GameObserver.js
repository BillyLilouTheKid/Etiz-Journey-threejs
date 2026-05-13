import { ObserverObjectEnum } from "../../types/enums";
import EntityHandler from "./handlers/EntityHandler";
import HitboxHandler from "./handlers/HitboxHandler";
import LevelHandler from "./handlers/LevelHandler";
import PlayerEventHandler from "./handlers/PlayerEventHandler";

// this class manage all the entities, items, props of the scene
// it contain channels to use fonction in order to interact with all the gameObject
class GameObserver {
    #worldSystem;
    #entities;
    #props;
    #items;

    #hitboxHandlerChannel
    #levelHandlerChannel
    #entitiesHandlerChannel
    #playerHandlerChannel

    constructor() {
        /**@type {Set<WorldSystem>} */
        this.#worldSystem = new Set(); // this map contain the worldSystem
        /** @type {Map<string, Entity>} */
        this.#entities = new Map(); // this map contain all the entites of the scene
        /** @type {Map<string, GameObject>} */
        this.#props = new Map(); // this map contain all the props of the scene
        /** @type {Map<string, GameObject>} */
        this.#items = new Map(); // this map contain all the items of the scene

        this.#hitboxHandlerChannel = new HitboxHandler(this.#entities, this.#props); // the hitbox channel interact with the entities and props of the scene
        this.#levelHandlerChannel = new LevelHandler(this.#worldSystem); // the level channel interact with the world
        this.#entitiesHandlerChannel = new EntityHandler(this.#worldSystem, this.#entities); // the entities channel interact with the world and the entities of the scene
        this.#playerHandlerChannel = new PlayerEventHandler(this.#entities); // the player channel interact with the entities

    }

    /**@param {WorldSystem} worldSystem */
    setWorldSystem(worldSystem) {
        this.#worldSystem.add(worldSystem);
    }

    /**@param {string} objectType */
    // return the map of the observer depending of the objectType
    getObserverObjectMap(objectType) {
        switch(objectType) {
            case ObserverObjectEnum.Player:
            case ObserverObjectEnum.Entity:
                return this.#entities;
            case ObserverObjectEnum.Props:
                return this.#props;
            case ObserverObjectEnum.Item:
                return this.#items;
            default:
                return null;
        }
    }

    /**
     * @param {string} type
     * @param {string} objectId 
    */
    // get the gameObject from the observer
    getGameObject(type, objectId) {
        const objectMap = this.getObserverObjectMap(type);
        if (objectMap) {
            return objectMap.get(objectId);
        }
    }

    /**
     * @param {GameObject} gameObject
    */
    // subscribe the gameObject to the GameObserver by insert it into the appropriate map
    subscribe(gameObject) {
        // get the map from the observer
        const gameObjectTypeMap = this.getObserverObjectMap(gameObject.getObjectType());
        if (gameObjectTypeMap) { // if it exist
            if (!gameObjectTypeMap.has(gameObject.getId())) {
                // we add the gameObject into the map with his id has a key
                gameObjectTypeMap.set(gameObject.getId(), gameObject);
                const [world] = this.#worldSystem;
                world.addGameObject(gameObject); // we add the entity into the world
            }
        }
        else {
            throw new Error("Cannot subscribe GameObject: Map type does not exist");
        }
    
    }

    /**
     * @param {GameObject} gameObject
    */
    // unsubscribe the gameObject from the GameObserver
    unsubscribe(gameObject) {
        // get the map from the observer
        const gameObjectTypeMap = this.getObserverObjectMap(gameObject.getObjectType());
        if (gameObjectTypeMap) { // if it exist
            const [world] = this.#worldSystem;
            world.removeGameObject(gameObject); // we remove the entity from the world
            gameObjectTypeMap.delete(gameObject.getId()); // we remove the gameObject from the map
        }
        else {
            throw new Error("Cannot unsubscribe GameObject: Map type does not exist");
        }
    }

    // return the hitbox handler
    getHitboxHandler(){
        return this.#hitboxHandlerChannel;
    }

    // return the level handler
    getLevelHandler(){
        return this.#levelHandlerChannel;
    }

    // return the entities handler
    getEntitiesHandler(){
        return this.#entitiesHandlerChannel;
    }

    // return the player handler
    getPlayerHandler(){
        return this.#playerHandlerChannel;
    }
}



export default new GameObserver();