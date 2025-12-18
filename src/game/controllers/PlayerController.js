import { Vec3, Quaternion } from "cannon-es";
import InputSystem from "../../engine/systems/InputSystem";
import { StateEnum } from "../../types/enums";
import Controller from "./base/Controller";
import PlayerAnimationSystem from "../../engine/animations/system/PlayerAnimationSystem";

export default class PlayerController extends Controller {
    constructor(body, speed, jump, triggerArea) {
        super(body, speed)
        this.jump = jump;
        // used to handle all user inputs
        this.inputSystem = new InputSystem(this.keyEvent);
        this.animationSystem = null;

        this.onGround = true;
        this.chargedPunchTimer = null;
        this.isGrabbingObject = false;
        this.isChargingPunch = false;
        this.comboStep = 1;

        this.triggerArea = triggerArea;

        this.crossStepDirection = null;
        
        // when the body is landing on the ground we update the isGround status
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

    // this function handle all the player control depending of the key inputs
    keyEvent = (keyCode, isPressed) => {
        switch(keyCode) {
            case 'ArrowLeft': 
                this.controls[0] = isPressed ? -1 : 0;
                this.crossStepDirection = this.controls[3] && isPressed ? "left" : null;
                break;
			case 'ArrowRight':  
                this.controls[0] = isPressed ? 1 : 0;
                this.crossStepDirection = this.controls[3] && isPressed ? "right" : null;
                break;
            case 'ArrowUp': 
                this.controls[1] = isPressed ? -1 : 0;
                this.crossStepDirection = this.controls[3] && isPressed ? "front" : null;
                break;
			case 'ArrowDown': 
                this.controls[1] = isPressed ? 1 : 0;
                this.crossStepDirection = this.controls[3] && isPressed ? "back" : null;
                break;
            // case ' ':
            //     if (!this.isGrabbingObject) this.controls[2] = this.onGround ? 1 : 0;
            //     break;
            case 'a':
            case 'q':
            case 'A':
            case 'Q':
                // if the player is not grabbing an object, released a button and is not charging his punch then
                // we do the attackCombo or else the player is charging a big punch
                !this.isGrabbingObject && !isPressed && !this.isChargingPunch? this.attackCombo() : this.chargedPunch(isPressed);
                break;
            case 'd':
            case 'D': // if the player press the d key, we try to grab an object
                if (isPressed) this.grabThrowObject();
                break;
            case 'Shift': // when pressing the shift key, we lock to the nearest target and then we cross walk
                this.lockToNearestTarget(isPressed);
                this.controls[3] = this.target ? 1 : 0;
                break;
        }  
    }

    // handle the charging punch control
    chargedPunch(isPressed) {
        // when we press the button, it initiate the charging punch
        if (!this.isChargingPunch && isPressed) {
            if (this.chargedPunchTimer == null) {
                // we set the chargedPunchTimer to put a delay of 800ms to make that the player is indeed charging his punch
                this.chargedPunchTimer = setTimeout(() => {
                    this.isChargingPunch = true;
                    this.animationSystem.playChargedPunchAction(true);
                }, 800); // if the player is still holding the button then we play the initCharging action and set the flag to true
            }
        }
        else if (this.isChargingPunch && !isPressed) { // if the player released the button while charging his punch
            this.isChargingPunch = false; // set the flag back to false
            this.chargedPunchTimer = null; // we delete the setTimeout function
            this.animationSystem.playChargedPunchAction(false); // we play the charging punch animation
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

    // this handle the combo punch control
    attackCombo() {
        // we pressing the punch button, it assume the player will initiate a charging punch.
        // but if immedialty released the button to throw a quick punch then we clear the timeout
        clearTimeout(this.chargedPunchTimer);
        this.chargedPunchTimer = null;
        const resetCombotStep = () => {
            this.comboStep = 1;
        }; // a callback function to reset the step of the punch combos
        this.animationSystem.playComboAction("Combo_Punch" + this.comboStep, resetCombotStep);
        if (this.comboStep < 4) {
            this.comboStep++; // everytime we hit the punch, we increased the step during the combo
        }
        else {
            this.comboStep = 1;
        }
    }
    
    // this function will find the nearest ennemy entity and lock the player rotation to it
    lockToNearestTarget(isPressed) {
        this.target = isPressed ? this.triggerArea.getNearestTarget() : null;
        if (this.target) {
            this.setBodyRotation(this.target.position.x - this.body.position.x, this.target.position.z - this.body.position.z, 1);
        }
    }

    setBodyRotation(posX, posY, interpolation = 0.1) {
        const targetAngle = Math.atan2(posX, posY); 
        // Create target quaternion
        const targetQuat = new Quaternion();
        targetQuat.setFromAxisAngle(new Vec3(0, 1, 0), targetAngle);

        // Smoothly rotate current quaternion toward target
        this.body.quaternion.slerp(targetQuat, interpolation, this.body.quaternion);
    }

    playerMouvement() {
        // input => physique
        const active = this.controls[ 0 ] !== 0 || this.controls[ 1 ] !== 0;
        const isLockedOn = this.controls[3] == 1;
        //console.log(`${active} && ${isLockedOn}`)
        const activeWhileLocked = active && isLockedOn;
		let state = isLockedOn ? StateEnum.Lockin : active ? StateEnum.Walk : StateEnum.Idle;
        if (activeWhileLocked) state = StateEnum[`CrossStep_${this.crossStepDirection}`];
        if (this.animationSystem) this.animationSystem.updateState(state);
        // Physic
        if (["Lockin","Walk","Run",].includes(state) || activeWhileLocked) {
            const force = this.speed; // ajuste
            this.body.velocity.x = this.controls[0] * force * (this.onGround ? 1 : 0.5);
            this.body.velocity.z = this.controls[1] * force * (this.onGround ? 1 : 0.5);

            const posX = !this.target ? this.controls[0] : this.target.position.x - this.body.position.x;
            const posY = !this.target ? this.controls[1] : this.target.position.z - this.body.position.z;
            this.setBodyRotation(posX, posY);
        }
        // jump
        // if (this.controls[2] === 1 && this.onGround && !this.isGrabbingObject) {
        //     this.animationSystem.playJumpAction(this.onGround);
        //     this.body.applyImpulse({ x: 0, y: this.jump, z: 0 });
        //     this.onGround = false;
        // }
    }

    // this function is run every tick
    tick() {
        this.playerMouvement();
    }
}