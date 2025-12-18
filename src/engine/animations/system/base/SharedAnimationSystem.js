import { LoopOnce } from 'three';
import { ArmatureLayerEnum, StateEnum } from '../../../../types/enums';
import { getClipFromProvider, addClipToProvider } from '../../provider/animationProvider';

export default class SharedAnimationSystem {
    constructor(objectName, mixer, animations) {
        this.objectName = objectName;
        this.mixer = mixer;
        this.stateActions = {};

        // Separate animation from type
        animations.forEach((clip) => {
            if (Object.values(StateEnum).includes(clip.name)) {
                this.stateActions[clip.name] = this.mixer.clipAction(clip);
            }
            else {
                addClipToProvider(clip, this.objectName, clip.name);
            }
        });

        // Current State
        this.currentStateName = StateEnum.Idle;
        this.currentStateAction = this.stateActions[this.currentStateName];
        this.currentStateAction.reset().play();

        // Temporary Action
        this.tempAction = null;
    }

    // --- State Handlers (idle, walk, run...)
    updateState(newState) {
        if (this.tempAction) return; // ignore if temp action play
        if (newState === this.currentStateName) return;

        const next = this.stateActions[newState];
        if (!next) return;

        this.crossFade(this.currentStateAction, next, 0.3);
        this.currentStateName = newState;
        this.currentStateAction = next;
    }

    

    // --- Actions handlers (attack, jump, etc.)
    playAction(action, loop = LoopOnce, clamp = false, backCrossFade = true, isTempPreviousAction = false) {
        const nextAction = action;

        // stop previous action if exist
        if (!isTempPreviousAction && this.tempAction) {
            this.tempAction.stop();
        }

        // launch the animation and stop at last frame
        nextAction.clampWhenFinished = clamp; // stop at the last frame
        nextAction.reset()
            .setLoop(loop)
            .setEffectiveWeight(1)
            .play();

        // Crossfade from state to 0
        const previousAction = !isTempPreviousAction ? this.currentStateAction : (this.tempAction ?? this.currentStateAction);
        previousAction.crossFadeTo(nextAction, 0.1, false);
        this.tempAction = nextAction;

        if (backCrossFade) {
            // When action finish we go back to the currentState animation
            const onFinished = (e) => {
                if (e.action === nextAction) {
                    this.mixer.removeEventListener('finished', onFinished);
                    this.crossFade(nextAction, this.currentStateAction, 0.2);
                    this.tempAction = null;
                }
            };
            this.mixer.addEventListener('finished', onFinished);
        }
    }

    playActionByName(actionName, loop = LoopOnce, clamp = false, backCrossFade = true, layer = ArmatureLayerEnum.All) {
        const action = this.mixer.clipAction(getClipFromProvider(this.objectName, actionName, layer));
        if (!action) return;
        this.playAction(action, loop, clamp, backCrossFade);
    }

    crossFade(from, to, duration) {
        to.enabled = true;
        to.reset().play();
        from.crossFadeTo(to, duration, false);
    }
}
