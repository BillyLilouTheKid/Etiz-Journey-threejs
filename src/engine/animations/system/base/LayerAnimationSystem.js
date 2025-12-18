import { LoopOnce } from 'three';
import { ArmatureLayerEnum, StateEnum } from '../../../../types/enums';
import { createActionByLayers } from '../../provider/animationProvider';

export default class LayerAnimationSystem {
    constructor(mixer, animations) {
        this.mixer = mixer;
        this.stateActions = {};
        this.gestureActions = {};

        // Separate animation from type
        animations.forEach((clip) => {
            if (Object.values(StateEnum).includes(clip.name)) {
                this.stateActions[clip.name] = createActionByLayers(this.mixer, clip, ["Upper", "Lower"]);
            } else {
                this.gestureActions[clip.name] = createActionByLayers(this.mixer, clip);
            }
        });

        // Current State
        this.currentStateName = StateEnum.Idle;
        this.currentStateAction = this.stateActions[this.currentStateName];
        Object.values(this.currentStateAction).forEach(state=>state.reset().play()); // play the action state on the Upper and Lower layer of the armature

        // Temporary Action
        this.tempAction = null;
    }

    // --- State Handlers (idle, walk, run...)
    updateState(newState) {
        if (newState === this.currentStateName) return;
        const nextState = this.stateActions[newState];
        if (!nextState) return;
        // get the layers from the temp actions (Upper/Lower/All/Both)
        const blockedLayers = this.tempAction ? this.tempAction.map(a => a.layerBodyMask) : [];
        // Crossfade only the layers that are not being used by a temp actions except is the temp action take the whole body
        for (const layer in nextState) {
            if (!blockedLayers.includes(layer) || blockedLayers.length == 2) {
                this.crossFade(this.currentStateAction[layer], nextState[layer], 0.3);
            }
        }

        this.currentStateName = newState;
        this.currentStateAction = nextState;
    }

    

    // --- Actions handlers (attack, jump, etc.)
    playAction(action, loop = LoopOnce, clamp = false, backCrossFade = true, isTempPreviousAction = false) {
        const nextActions = Array.isArray(action) ? action : [action];

        // stop previous action if exist
        if (!isTempPreviousAction && this.tempAction) {
            this.tempAction.forEach((action)=>action.stop());
        }

        // launch the animation and stop at last frame
        nextActions.forEach((action)=>{
            action.clampWhenFinished = clamp; // stop at the last frame if it's true
            action.reset()
                .setLoop(loop)
                .setEffectiveWeight(1)
                .play();
        });

        // Crossfade from state to 0
        // isTempPreviousAction represent that a previous action was not a state but a gesture (like chaining action from the user input)
        // otherwise it is just the entity is only doing a state action from the moment before doing an action
        const stateActionsLayer = nextActions.map((action)=>this.currentStateAction[action.layerBodyMask]);
        const previousActions = !isTempPreviousAction ? stateActionsLayer : (this.tempAction ?? stateActionsLayer);
        previousActions.forEach((pAction)=>{
            pAction.crossFadeTo(nextActions.find((nAction)=>nAction.layerBodyMask == pAction.layerBodyMask), 0.1, false)
        });
        this.tempAction = nextActions;

        if (backCrossFade) {
            // When action finish we go back to the currentState animation
            const onFinished = (e) => {
                if (nextActions.includes(e.action)) {
                    const finishedActionLayer = e.action.layerBodyMask;
                    if ((nextActions.length < 2 && finishedActionLayer == "Upper") || (nextActions.length == 2 && finishedActionLayer == "Lower")) {
                        this.mixer.removeEventListener('finished', onFinished);
                    }
                    this.crossFade(nextActions.find((action)=>action == e.action), this.currentStateAction[e.action.layerBodyMask], 0.2);
                    this.tempAction = null;
                }
            };
            this.mixer.addEventListener('finished', onFinished);
        }
    }

    playActionByName(actionName, loop = LoopOnce, clamp = false, backCrossFade = true, layer = ArmatureLayerEnum.Both) {
        const action = this.gestureActions[actionName][layer];
        if (!action) return;
        this.playAction(action, loop, clamp, backCrossFade);
    }

    crossFade(from, to, duration) {
        to.enabled = true;
        to.reset().play();
        from.crossFadeTo(to, duration, false);
    }
}
