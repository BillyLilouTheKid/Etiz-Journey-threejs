import { LoopOnce } from 'three';
import { ArmatureLayerEnum, StateEnum } from '../../../../types/enums';
import { createActionByLayers } from '../../provider/animationProvider';

export default class LayerAnimationSystem {
    /**
     * @param {AnimationMixer} mixer
     * @param {AnimationClip[]} animations
     */
    constructor(mixer, animations) {
        this.mixer = mixer;
        /** @type {Record<string, LayerActions>} */
        this.stateActions = {};
        /** @type {Record<string, LayerActions>} */
        this.gestureActions = {};

        // Separate animation from type
        animations.forEach((clip) => {
            if (Object.values(StateEnum).includes(/** @type {any} */ (clip.name))) {
                this.stateActions[clip.name] = createActionByLayers(this.mixer, clip, ["Upper", "Lower"]);
            } else {
                this.gestureActions[clip.name] = createActionByLayers(this.mixer, clip);
            }
        });

        // Current State
        this.currentStateName = StateEnum.Idle;
        this.currentStateAction = this.stateActions[this.currentStateName];
        Object.values(this.currentStateAction).flat().forEach(state=>state.reset().play()); // play the action state on the Upper and Lower layer of the armature

        // Temporary Action
        this.tempAction = null;
    }

    // --- State Handlers (idle, walk, run...)
    /**
     * @param {string} newState
     */
    updateState(newState) {
        if (newState === this.currentStateName) return;
        const nextState = this.stateActions[newState];
        if (!nextState) return;
        // get the layers from the temp actions (Upper/Lower/All/Both)
        const blockedLayers = this.tempAction ? this.tempAction.map(a => a.layerBodyMask) : [];
        // Crossfade only the layers that are not being used by a temp actions except if the temp action take the whole body
        for (const layer in nextState) {
            if (!blockedLayers.includes(layer) || blockedLayers.length == 2) {
                this.crossFade(this.currentStateAction[layer], nextState[layer], 0.3);
            }
        }
        /** @type {string} */
        this.currentStateName = newState;
        this.currentStateAction = nextState;
    }

    

    // --- Actions handlers (attack, jump, etc.)
    /**
     * @param {GameAnimationAction[]} action
     * @param {AnimationActionLoopStyles} loop
     * @param {boolean} clamp
     * @param {boolean} backCrossFade
     * @param {boolean} isTempPreviousAction
     * @param {any} callbackEnd
     */
    playAction(action, loop = LoopOnce, clamp = false, backCrossFade = true, isTempPreviousAction = false, callbackEnd = null) {
        const nextActions = action;

        // stop previous action if exist
        if (!isTempPreviousAction && this.tempAction) {
            this.tempAction.forEach((action)=>action.stop());
        }

        const repetitions = loop === LoopOnce ? 1 : Infinity;

        // launch the animation and stop at last frame
        nextActions.forEach((action)=>{
            action.clampWhenFinished = clamp; // stop at the last frame if it's true
            action.reset()
                .setLoop(loop, repetitions)
                .setEffectiveWeight(1)
                .play();
        });

        // Crossfade from state to 0
        // isTempPreviousAction represent that a previous action was not a state but a gesture (like chaining action from the user input)
        // otherwise it is just the entity is only doing a state action from the moment before doing an action
        const stateActionsLayer = nextActions.map((action)=>this.currentStateAction[/** @type {string} */ (action.layerBodyMask)][0]);
        const previousActions = !isTempPreviousAction ? stateActionsLayer : (this.tempAction ?? stateActionsLayer);
        previousActions.forEach((pAction)=>{
            const target = nextActions.find(
                nAction => nAction.layerBodyMask === pAction.layerBodyMask
            );
            if (!target) return;
            pAction.crossFadeTo(target, 0.1, false)
        });
        this.tempAction = nextActions;

        if (backCrossFade) {
            // When action finish we go back to the currentState animation
            const onFinished = (/**@type {AnimationFinishedEvent}*/ e) => {
                if (nextActions.includes(e.action)) {
                    const finishedActionLayer = e.action.layerBodyMask;
                    if ((nextActions.length < 2 && finishedActionLayer == "Upper") || (nextActions.length == 2 && finishedActionLayer == "Lower")) {
                        this.mixer.removeEventListener('finished', onFinished);
                    }
                    const layer = e.action.layerBodyMask;
                    const fromAction = nextActions.find(action => action === e.action);
                    if (!fromAction || !layer) return;
                    this.crossFade([fromAction], this.currentStateAction[layer], 0.2);
                    this.tempAction = null;
                    if (callbackEnd) callbackEnd();
                }
            };
            this.mixer.addEventListener('finished', onFinished);
        }
    }

    /**
     * @param {string} actionName
     * @param {AnimationActionLoopStyles} loop
     * @param {boolean} clamp
     * @param {boolean} backCrossFade
     * @param {string} layer
     * @param {any} callbackEnd
     */
    playActionByName(actionName, loop = LoopOnce, clamp = false, backCrossFade = true, layer = ArmatureLayerEnum.Both, callbackEnd = null) {
        const action = this.gestureActions[actionName][layer];
        if (!action) return;
        this.playAction(action, loop, clamp, backCrossFade, false, callbackEnd);
    }

    /**
     * @param {GameAnimationAction[]} fromActions
     * @param {GameAnimationAction[]} toActions
     * @param {number} duration
     */
    crossFade(fromActions, toActions, duration) {

        fromActions.forEach(action => {
            action.fadeOut(duration);
        });

        toActions.forEach(action => {
            action
                .reset()
                .fadeIn(duration)
                .play();
        });
    }
}
