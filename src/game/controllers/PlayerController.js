import { Vec3, Quaternion } from "cannon-es";
import InputSystem from "../../engine/systems/InputSystem";
import { StateEnum } from "../../types/enums";
import Controller from "./base/Controller";
import PlayerAnimationSystem from "../../engine/animations/PlayerAnimationSystem";

export default class PlayerController extends Controller {
    constructor(body, speed, jump) {
        super(body, speed)
        this.jump = jump;
        this.inputSystem = new InputSystem(this.keyEvent);
        this.animationSystem = null;

        this.onGround = true;
        this.isChargingPunch = false;
        this.chargedPunchTimer = null;
        this.isGrabbingObject = null;
        this.comboStep = 1;
        
        this.body.addEventListener("collide", (event) => {
            if (event.body.isGround) {
                if (!this.onGround) this.animationSystem.playJumpAction(false);
                this.onGround = true;
            }
        });
    }


    setPlayerAnimations(mixer, animations) {
        this.animationSystem = new PlayerAnimationSystem(mixer, animations);
    }

    keyEvent = (keyCode, isPressed) => {
        switch(keyCode) {
            case 'ArrowLeft': 
                this.controls[0] = isPressed ? -1 : 0; 
                break;
			case 'ArrowRight':  
                this.controls[0] = isPressed ? 1 : 0;
                break;
            case 'ArrowUp': 
                this.controls[1] = isPressed ? -1 : 0;
                break;
			case 'ArrowDown': 
                this.controls[1] = isPressed ? 1 : 0; 
                break;
            case ' ':
                if (!this.isGrabbingObject) this.controls[2] = this.onGround ? 1 : 0;
                break;
            case 'a':
            case 'q':
                !this.isGrabbingObject && !isPressed && !this.isChargingPunch? this.attackCombo() : this.chargedPunch(isPressed);
                break;
            case 'd':
                if (isPressed) this.grabThrowObject();
                break;
        }  
    }

    chargedPunch(isPressed) {
        if (!this.isChargingPunch && isPressed) {
            if (this.chargedPunchTimer == null) {
                this.chargedPunchTimer = setTimeout(() => {
                    this.isChargingPunch = true;
                    this.animationSystem.playChargedPunchAction(true);
                },800);
            }
        }
        else if (this.isChargingPunch && !isPressed) {
            this.isChargingPunch = false;
            this.chargedPunchTimer = null;
            this.animationSystem.playChargedPunchAction(false);
        }

    }

    grabThrowObject() {
        if (!this.isGrabbingObject) {
            this.isGrabbingObject = true;
            this.animationSystem.playGrabThrowActions(this.isGrabbingObject);
        }
        else {
            this.isGrabbingObject = false;
            this.animationSystem.playGrabThrowActions(this.isGrabbingObject);
        }
    }

    attackCombo() {
        clearTimeout(this.chargedPunchTimer);
        this.chargedPunchTimer = null;
        const resetCombotStep = () => {
            this.comboStep = 1;
        };
        this.animationSystem.playComboAction("Combo_Punch" + this.comboStep, resetCombotStep);
        if (this.comboStep < 4) {
            this.comboStep++;
        }
        else {
            this.comboStep = 1;
        }
    }

    playerMouvement() {
        // input => physique
        const active = this.controls[ 0 ] !== 0 || this.controls[ 1 ] !== 0;
		const state = active ? StateEnum.Walk : StateEnum.Idle;
        if (this.animationSystem) this.animationSystem.updateState(state);
            // Physique
        if (["Walk","Run"].includes(state)) {
            const force = this.speed; // ajuste
            this.body.velocity.x = this.controls[0] * force * (this.onGround ? 1 : 0.5);
            this.body.velocity.z = this.controls[1] * force * (this.onGround ? 1 : 0.5);

            const targetAngle = Math.atan2(this.controls[0], this.controls[1]); 
            // Create target quaternion
            const targetQuat = new Quaternion();
            targetQuat.setFromAxisAngle(new Vec3(0, 1, 0), targetAngle);

            // Smoothly rotate current quaternion toward target
            const newQuat = new Quaternion();
            this.body.quaternion.slerp(targetQuat, 0.1, newQuat);
            this.body.quaternion.copy(newQuat);
        }
        if (this.controls[2] === 1 && this.onGround && !this.isGrabbingObject) {
            this.animationSystem.playJumpAction(this.onGround);
            this.body.applyImpulse({ x: 0, y: this.jump, z: 0 });
            this.onGround = false;
        }
    }

    tick() {
        this.playerMouvement();
    }
}