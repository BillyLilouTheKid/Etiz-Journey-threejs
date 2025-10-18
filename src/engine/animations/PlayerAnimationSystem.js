import { AnimationUtils, LoopOnce, LoopPingPong } from "three";
import AnimationSystem from "./base/AnimationSystem";

export default class PlayerAnimationSystem extends AnimationSystem{
    constructor(mixer, animations) {
        super(mixer, animations);
        this.chargedPunchTimer = null;

        this.jumpActions = {};
        this.grabActions = {};
        this.initPlayerActions();
    }

    initPlayerActions() {
        const comboClip = this.gestureActions["Attack_combo"].getClip();
        const chargedClip = this.gestureActions["Charged_punch"].getClip();
        const grabClip = this.gestureActions["Grab_Throw"].getClip();
        const jumpClip = this.gestureActions["Jump"].getClip();

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
            AnimationUtils.subclip(jumpClip, "Jump_Air", 8, 14),
            AnimationUtils.subclip(jumpClip, "Jump_Land", 14, 24)
        ];
        clipList.forEach((clip)=>{
            this.gestureActions[clip.name] = this.mixer.clipAction(clip);
        });
        delete this.gestureActions["Attack_combo"];
        delete this.gestureActions["Charged_punch"];
        delete this.gestureActions["Grab_Throw"];
        delete this.gestureActions["Jump"];
        
    }

    playComboAction(comboName, comboStepReset) {
        const comboAction = this.gestureActions[comboName];
        this.playAction(comboAction, LoopOnce, true, false, comboName !== "Combo_Punch1");
        
        const onComboStop = (e) => {
            if (["Combo_Punch1","Combo_Punch2","Combo_Punch3","Combo_Punch4"].includes(e.action.getClip().name)) {
                this.mixer.removeEventListener('finished', onComboStop);
                comboStepReset();
                this.tempAction = null;
                this.crossFade(comboAction, this.currentStateAction, 0.2);
            }
        };
        this.mixer.addEventListener('finished', onComboStop);
    }

    playChargedPunchAction(isCharging) {
        if (isCharging) {
            const initChargeAction = this.gestureActions["ChargedPunch_Init"];
            this.playAction(initChargeAction, LoopOnce, true, false);

            const onFinishInitCharging = (e) => {
                if (e.action === initChargeAction) {
                    this.mixer.removeEventListener('finished', onFinishInitCharging);
                    const holdChargeAction = this.gestureActions["ChargedPunch_Hold"];
                    holdChargeAction.reset().setLoop(LoopPingPong).setEffectiveWeight(1).play();
                    this.crossFade(initChargeAction, holdChargeAction, 0.2);
                    this.tempAction = holdChargeAction;
                }
            };
            this.mixer.addEventListener('finished', onFinishInitCharging);
        }
        else {
            const chargedPunch = this.gestureActions["ChargedPunch_Release"];
            this.playAction(chargedPunch, LoopOnce, true, true, true);
        }
    }

    playGrabThrowActions(isGrabbingObject) {
        if (isGrabbingObject) {
            const grabAction = this.gestureActions["Grab"];
            this.playAction(grabAction, LoopOnce, true, false);
        }
        else {
            const throwAction = this.gestureActions["Throw"];
            this.playAction(throwAction, LoopOnce, true, true, true);
        }
    }
    

    playJumpAction(onground) {
        if (onground) {
            const jumpInitAction = this.gestureActions["Jump_Init"];
            this.playAction(jumpInitAction, LoopOnce, true, false);

            const onFinishInitJump = (e) => {
                if (e.action === jumpInitAction) {
                    this.mixer.removeEventListener('finished', onFinishInitJump);
                    const inAirAction = this.gestureActions["Jump_Air"];
                    inAirAction.reset().setLoop(LoopPingPong).setEffectiveWeight(1).play();
                    this.crossFade(jumpInitAction, inAirAction, 0.2);
                    this.tempAction = inAirAction;
                }
            };
            this.mixer.addEventListener('finished', onFinishInitJump);
        }
        else {
            const jumpLandingAction = this.gestureActions["Jump_Land"];
            this.playAction(jumpLandingAction, LoopOnce, true, true, true);
        }
    }
}