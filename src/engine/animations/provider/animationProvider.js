import { AnimationClip } from "three";
import { ArmatureBonesLayer } from "../../../constants/config/armatureLayers";
import { ArmatureLayerEnum } from "../../../types/enums";


// object of Maps, where each object key maps to a Map of actions, and each action key maps to an object containing clips for each layer (Upper, Lower, All)
/** @type {AnimationProvider} */
let AnimationProvider = {};

// this function return an AnimationClip targeting the selected bones from the armatures
/**
 * @param {AnimationClip} clip
 * @param {string[]} boneNames
 */
function filterClipByBones(clip, boneNames) {
    const tracks = clip.tracks.filter((/** @type {{ name: string | any[]; }} */ track) => 
        boneNames.some((/** @type {string} */ name) => track.name.includes(name))
    );
    return new AnimationClip(clip.name, clip.duration, tracks);
}

// this function add an AnimationClip to the provider
/**
 * @param {AnimationClip} clip
 * @param {string | number} entityType
 * @param {string} actionName
 */
function addClipToProvider(clip, entityType, actionName) {
    if (!AnimationProvider[entityType]) { // if the entityType does not exist, we create an hashmap
        AnimationProvider[entityType] = new Map();
    }
    if (!AnimationProvider[entityType].has(actionName)) { // if the entityType map don't already have an entry for the action
        /** @type {LayerClips} */
        const layerClips = {
            "All": new AnimationClip(clip.name, clip.duration, clip.tracks),
            "Upper": filterClipByBones(clip, ArmatureBonesLayer[ArmatureLayerEnum.Upper]),
            "Lower": filterClipByBones(clip, ArmatureBonesLayer[ArmatureLayerEnum.Lower]),
        }; // we create an object containing all the layer "All", "Upper", "Lower" clips
        AnimationProvider[entityType].set(actionName, layerClips); // we set the action name to the animationProvider
    }
}

// this function create an object containing AnimationAction by bones layers
/**
 * @param {import('three').AnimationMixer} mixer
 * @param {AnimationClip} clip
 * @param {string[]} selectedLayers
 */
function createActionByLayers(mixer, clip, selectedLayers = [ArmatureLayerEnum.All, ArmatureLayerEnum.Upper, ArmatureLayerEnum.Lower, ArmatureLayerEnum.Both]) {
    /** @type {LayerActions} */
    const layerActions = {
        "All": [mixer.clipAction(clip)],
        "Upper": [mixer.clipAction(filterClipByBones(clip, ArmatureBonesLayer["Upper"]))],
        "Lower": [mixer.clipAction(filterClipByBones(clip, ArmatureBonesLayer["Lower"]))],
    }; // we create an object containing all the layer "All", "Upper", "Lower" actions

    for (const layer of Object.keys(layerActions)) {
        layerActions[layer][0].layerBodyMask = layer;
    }

    // we add a new property "Both" that is an array containing the clip for the Upper and Lower part of the armature
    layerActions[ArmatureLayerEnum.Both] = [
        /** @type {GameAnimationAction} */ (layerActions[ArmatureLayerEnum.Upper][0]),
        /** @type {GameAnimationAction} */ (layerActions[ArmatureLayerEnum.Lower][0])
    ];

    /** @type {Record<string, GameAnimationAction[]>} */
    const filtered = {};

    for (const layer of Object.keys(layerActions)) {
        if (!selectedLayers.includes(layer)) continue;
        filtered[layer] = layerActions[layer];
    }

    return filtered;
}

// this function remove a clip from the animationProvider
/**
 * @param {string} entityType
 * @param {string} actionName
 */
function removeClipFromProvider(entityType, actionName) {
    if (AnimationProvider?.[entityType].has(actionName)) { // if the clip exist in the map of the entityType of the provider
        AnimationProvider[entityType].delete(actionName); // we delete the action from the provider
        if (AnimationProvider[entityType].size == 0) { // if the map of the entityType is empty then
            delete AnimationProvider[entityType]; // we delete the map
        }
    }
}

// this function get the clip to build the action from the animationProvider
/**
 * @param {string} entityType
 * @param {string} actionName
 * @param {string} armatureLayer
 * @returns {AnimationClip}
 */
function getClipFromProvider(entityType, actionName, armatureLayer = ArmatureLayerEnum.All) {
    const entity = AnimationProvider?.[entityType];
    if (entity) { // we get the entity
        if (entity.has(actionName)) { // we get the clip action from the entity
            const clip = entity.get(actionName)?.[armatureLayer];
            if (clip) { // we get the layer of the clip
                return clip;
            }
            else {
                throw new Error("Layer does not exist!");
            }
        }
        else {
             throw new Error("Action does not exist!");
        }
    }
    else {
         throw new Error("Entity does not exist!");
    }
}

// this function clear the animationProvider simple
function clearProvider() {
    AnimationProvider = {};
}

export {addClipToProvider, createActionByLayers, removeClipFromProvider, getClipFromProvider, clearProvider};