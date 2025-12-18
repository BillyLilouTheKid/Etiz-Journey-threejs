import { ArmatureBonesLayer } from "../../../constants/config/armatureLayers";
import { ArmatureLayerEnum } from "../../../types/enums";
import { AnimationClip } from "three";

// object of Maps, where each object key maps to a Map of actions, and each action key maps to an object containing clips for each layer (Upper, Lower, All)
const AnimationProvider = {};

// this function return an AnimationClip targeting the selected bones from the armatures
function filterClipByBones(clip, boneNames) {
    const tracks = clip.tracks.filter(track => 
        boneNames.some(name => track.name.includes(name))
    );
    return new AnimationClip(clip.name, clip.duration, tracks);
}

// this function add an AnimationClip to the provider
function addClipToProvider(clip, entityType, actionName) {
    if (!AnimationProvider[entityType]) { // if the entityType does not exist, we create an hashmap
        AnimationProvider[entityType] = new Map();
    }
    if (!AnimationProvider[entityType].has(actionName)) { // if the entityType map don't already have an entry for the action
        const layerClips = {
            "All": new AnimationClip(clip.name, clip.duration, clip.tracks),
            "Upper": filterClipByBones(clip, ArmatureBonesLayer[ArmatureLayerEnum.Upper]),
            "Lower": filterClipByBones(clip, ArmatureBonesLayer[ArmatureLayerEnum.Lower]),
        }; // we create an object containing all the layer "All", "Upper", "Lower" clips
        // we add a new property "Both" that is an array containing the clip for the Upper and Lower part of the armature
        layerClips[ArmatureLayerEnum.Both] = [layerClips[ArmatureLayerEnum.Upper], layerClips[ArmatureLayerEnum.Lower]];
        AnimationProvider[entityType].set(actionName, layerClips); // we set the action name to the animationProvider
    }
}

// this function create an object containing AnimationAction by bones layers
function createActionByLayers(mixer, clip, selectedLayers = [ArmatureLayerEnum.All, ArmatureLayerEnum.Upper, ArmatureLayerEnum.Lower, ArmatureLayerEnum.Both]) {
    const layerActions = {
        "All": mixer.clipAction(clip),
        "Upper": mixer.clipAction(filterClipByBones(clip, ArmatureBonesLayer["Upper"])),
        "Lower": mixer.clipAction(filterClipByBones(clip, ArmatureBonesLayer["Lower"])),
    }; // we create an object containing all the layer "All", "Upper", "Lower" actions
    // we add a new property "Both" that is an array containing the clip for the Upper and Lower part of the armature
    layerActions[ArmatureLayerEnum.Both] = [layerActions[ArmatureLayerEnum.Upper], layerActions[ArmatureLayerEnum.Lower]];
    for (const layer in layerActions) {
        if (selectedLayers.includes(layer)) { // we check if the layer from object is part of the selectedLayers
            layerActions[layer].layerBodyMask = layer; // we add a layerBodyMask property to say the layer the action is on
        }
        else { // if not then we delete it
            delete layerActions[layer];
        }
    }
    return layerActions;
}

// this function remove a clip from the animationProvider
function removeClipFromProvider(entityType, actionName) {
    if (AnimationProvider?.[entityType].has(actionName)) { // if the clip exist in the map of the entityType of the provider
        AnimationProvider[entityType].delete(actionName); // we delete the action from the provider
        if (AnimationProvider[entityType].size == 0) { // if the map of the entityType is empty then
            delete AnimationProvider[entityType]; // we delete the map
        }
    }
}

// this function get the clip to build the action from the animationProvider
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