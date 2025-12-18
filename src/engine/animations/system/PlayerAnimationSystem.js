import { AnimationUtils, LoopOnce, LoopPingPong, LoopRepeat } from "three";
import LayerAnimationSystem from "./base/LayerAnimationSystem";
import { createActionByLayers } from "../provider/animationProvider";
import { ArmatureLayerEnum } from "../../../types/enums";

export default class PlayerAnimationSystem extends LayerAnimationSystem{
    constructor(mixer, animations) {
        super(mixer, animations);
        this.chargedPunchTimer = null;
        this.initPlayerActions();
    }

    initPlayerActions() {
        const comboClip = this.gestureActions["Attack_combo"]["All"].getClip();
        const chargedClip = this.gestureActions["Charged_punch"]["All"].getClip();
        const grabClip = this.gestureActions["Grab_Throw"]["All"].getClip();
        const jumpClip = this.gestureActions["Jump"]["All"].getClip();

        const clipList = [
            AnimationUtils.subclip(comboClip, "Combo_Punch1", 0, 18),
            AnimationUtils.subclip(comboClip, "Combo_Punch2", 24, 42),
            AnimationUtils.subclip(comboClip, "Combo_Punch3", 48, 66),
            AnimationUtils.subclip(comboClip, "Combo_Punch4", 72, 88),

            AnimationUtils.subclip(chargedClip, "ChargedPunch_Init", 0, 8),
            AnimationUtils.subclip(chargedClip, "ChargedPunch_Hold", 8, 14),
            AnimationUtils.subclip(chargedClip, "ChargedPunch_Release", 14, 26),

            AnimationUtils.subclip(grabClip, "Grab", 0, 12),
            AnimationUtils.subclip(grabClip, "Throw", 12, 24),

            AnimationUtils.subclip(jumpClip, "Jump_Init", 0, 8),
            AnimationUtils.subclip(jumpClip, "Jump_Air", 8, 20),
            AnimationUtils.subclip(jumpClip, "Jump_Land", 20, 30),
        ];

        clipList.forEach((clip)=>{
            this.gestureActions[clip.name] = createActionByLayers(this.mixer, clip);
        });

        delete this.gestureActions["Attack_combo"];
        delete this.gestureActions["Charged_punch"];
        delete this.gestureActions["Grab_Throw"];
        delete this.gestureActions["Jump"];
        delete this.gestureActions["Init_lock"];
        delete this.gestureActions["Cross_steps"];
    }

    playComboAction(comboName, comboStepReset) {
        // if it is the last combo punch or the state of the player is idle, the combo punch animation is played on both body layer
        const layer = comboName == "Combo_Punch4" || this.currentStateName == "Idle" ? "Both" : "Upper";
        const comboAction = this.gestureActions[comboName][layer];
        this.playAction(comboAction, LoopOnce, true, false, comboName !== "Combo_Punch1");
        
        const onComboStop = (e) => {
            const finishedActionLayer = e.action.getClip().name;
            if (["Combo_Punch1","Combo_Punch2","Combo_Punch3","Combo_Punch4"].includes(e.action.getClip().name)) {
                // if the finished action animation was for the upper part (no Both layer) or the action was for Both layer and it is the Lower layer (witch the last and the upper part is finished)
                if ((layer != "Both" && finishedActionLayer == "Upper") || (layer == "Both" && finishedActionLayer == "Lower")) {
                    this.mixer.removeEventListener('finished', onComboStop);
                }
                comboStepReset();
                this.tempAction = null;
                this.crossFade(e.action, this.currentStateAction[e.action.layerBodyMask], 0.2);
            }
        };
        this.mixer.addEventListener('finished', onComboStop);
    }

    playChargedPunchAction(isCharging) {
        if (isCharging) {
            const initChargeAction = this.gestureActions["ChargedPunch_Init"]["Upper"];
            this.playAction(initChargeAction, LoopOnce, true, false);

            // when the first charging punch animation finished, we play this function
            const onFinishInitCharging = (e) => {
                if (e.action === initChargeAction) {
                    this.mixer.removeEventListener('finished', onFinishInitCharging); // we remove the listener
                    const holdChargeAction = this.gestureActions["ChargedPunch_Hold"]["Upper"];
                    holdChargeAction.reset().setLoop(LoopPingPong).setEffectiveWeight(1).play();
                    this.crossFade(initChargeAction, holdChargeAction, 0.2);
                    this.tempAction = [holdChargeAction];
                }
            };
            this.mixer.addEventListener('finished', onFinishInitCharging);
        }
        else { // we release the charging punch we play the action
            const chargedPunch = this.gestureActions["ChargedPunch_Release"]["Upper"];
            this.playAction(chargedPunch, LoopOnce, true, true, true);
        }
    }

    playGrabThrowActions(isGrabbingObject) {
        // if the player is grabbing an object then we play the grabbing animation
        if (isGrabbingObject) {
            const grabAction = this.gestureActions["Grab"]["Upper"];
            this.playAction(grabAction, LoopOnce, true, false);
        }
        else { // if the player have an object in his hand, we play the throw animation to throw the object
            const throwAction = this.gestureActions["Throw"]["Upper"];
            this.playAction(throwAction, LoopOnce, true, true, true);
        }
    }
    
    // this handle the jump animation
    playJumpAction(onground) {
        // if the player is on the ground and is gonna jump then we play the jump animation
        if (onground) {
            const jumpInitAction = this.gestureActions["Jump_Init"]["Both"];
            this.playAction(jumpInitAction, LoopOnce, true, false);

            // this function will run after the end of the init jump action
            const onFinishInitJump = (e) => {
                if (jumpInitAction.includes(e.action)) {
                    if (e.action.layerBodyMask == "Lower") { // if the finished action is from the lower part of the body then
                        this.mixer.removeEventListener('finished', onFinishInitJump); // we delete the listener
                    }
                    const inAirAction = this.gestureActions["Jump_Air"]["Both"]; // we play the animation in air loop
                    inAirAction.forEach((action)=>{
                        action.reset().setLoop(LoopRepeat).setEffectiveWeight(1).play();
                        this.crossFade(jumpInitAction[jumpInitAction.findIndex((jAction)=>jAction.layerBodyMask === e.action.layerBodyMask)], action, 0.2);
                    });
                    this.tempAction = inAirAction;
                }
            };
            this.mixer.addEventListener('finished', onFinishInitJump);
        }
        else { // when landing we play the landing jump animation
            const jumpLandingAction = this.gestureActions["Jump_Land"]["Both"];
            this.playAction(jumpLandingAction, LoopOnce, true, true, true);
        }
    }

    resetCrossStepAnimations() {
        ["CrossStep_left","CrossStep_right","CrossStep_front","CrossStep_back"].forEach((crossStepState)=>{
            for (const [key, value] of Object.entries(this.stateActions[crossStepState])) {
                value.crossFadeTo(this.currentStateAction[key]);
            }
        })
    }
}