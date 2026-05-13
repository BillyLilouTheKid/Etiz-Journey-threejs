import { Vec3, Quaternion } from "cannon-es";
import InputSystem from "../../engine/systems/InputSystem";
import { CrossStepState, ObserverObjectEnum, StateEnum, TypeOfAttack } from "../../types/enums";
import Controller from "./base/Controller";
import PlayerAnimationSystem from "../../engine/animations/system/PlayerAnimationSystem";
import GameObserver from "../../engine/observer/GameObserver";
import { LoopOnce } from "three";

export default class PlayerController extends Controller {
    /**
     * @param {string} playerId
     */
    constructor(playerId) {
        /**@type {Entity} */
        const playerEntity = GameObserver.getGameObject(ObserverObjectEnum.Entity, playerId);
        super(playerEntity.body, playerEntity.speed)
        this.rootEntity = playerEntity;
        // used to handle all user inputs
        this.inputSystem = new InputSystem(this.keyEvent);
        this.animationSystem = null;

        this.onGround = true;
        this.chargedPunchTimer = null;
        this.isChargingPunch = false;
        this.comboStep = 1;

        /**@type {CrossStepDirection | null} */
        this.crossStepDirection = null;
        
        // when the body is landing on the ground we update the isGround status
        this.body.addEventListener("collide", (/** @type {CollideEvent}*/event) => {
            if (event.body.isGround) {
                // if (!this.rootEntity.onGround) this.animationSystem.playJumpAction(false);
                this.rootEntity.onGround = true;
            }
        });
    }



    /**
     * 
     * @param {AnimationMixer} mixer 
     * @param {AnimationClip[]} animations 
     */
    setPlayerAnimations(mixer, animations) {
        this.animationSystem = new PlayerAnimationSystem(mixer, animations);
    }

    /**
     * @param {string} keyCode
     * @param {boolean} isPressed
     */
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
            //     if (!this.isGrabbingObject) this.controls[2] = this.rootEntity.onGround ? 1 : 0;
            //     break;
            case 'a':
            case 'q':
            case 'A':
            case 'Q':
                // if the player is not grabbing an object, released a button and is not charging his punch then
                // we do the attackCombo or else the player is charging a big punch
                if (!this.carriedEntity) !isPressed && !this.isChargingPunch ? this.attackCombo() : this.chargedPunch(isPressed);
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

    /**
     * 
     * @param {boolean} isPressed 
     */
    // handle the charging punch control
    chargedPunch(isPressed) {
        // when we press the button, it initiate the charging punch
        if (!this.isChargingPunch && isPressed) {
            if (this.chargedPunchTimer == null) {
                // we set the chargedPunchTimer to put a delay of 800ms to make that the player is indeed charging his punch
                this.chargedPunchTimer = setTimeout(() => {
                    this.isChargingPunch = true;
                    this.animationSystem?.playChargedPunchAction(true);
                }, 800); // if the player is still holding the button then we play the initCharging action and set the flag to true
            }
        }
        else if (this.isChargingPunch && !isPressed) { // if the player released the button while charging his punch
            this.isChargingPunch = false; // set the flag back to false
            this.chargedPunchTimer = null; // we delete the setTimeout function
            this.animationSystem?.playChargedPunchAction(false); // we play the charging punch animation
            this.rootEntity.activeHitbox.activate(100,{damage: 50, pushForce:100, typeAttack: TypeOfAttack.Charged});
        }

    }

    // handle the grapping and throw of an entity
    grabThrowObject() {
        // if the player does not have any carried entity on his hand
        if (!this.carriedEntity) {
            // we get the entity intersecting the player hitbox
            const liftedEntity = this.rootEntity.activeHitbox.lift();
            if (liftedEntity) {
                this.animationSystem?.playGrabAction(); // we play the grab action animation
                this.liftEntity(liftedEntity);
                // if the lifted entity does have a lifted controller method
                if (liftedEntity.controller.lifted) liftedEntity.controller.lifted(); // we play the lifted animation
            }
        }
        else {
            this.thrownEntity();
            this.animationSystem?.playThrowAction(); // we play the thrown action animation
        }
    }

    // this handle the combo punch control
    attackCombo() {
        // we pressing the punch button, it assume the player will initiate a charging punch.
        // but if immedialty released the button to throw a quick punch then we clear the timeout
        if (this.chargedPunchTimer) clearTimeout(this.chargedPunchTimer);
        this.chargedPunchTimer = null;
        const resetCombotStep = () => {
            this.comboStep = 1;
        }; // a callback function to reset the step of the punch combos
        this.animationSystem?.playComboAction("Combo_Punch" + this.comboStep, resetCombotStep);
        if (this.comboStep < 4) {
            this.comboStep++; // everytime we hit the punch, we increased the step during the combo
            this.rootEntity.activeHitbox.activate(100,{damage: 10, typeAttack: TypeOfAttack.Normal});
        }
        else {
            this.comboStep = 1;
            this.rootEntity.activeHitbox.activate(100,{damage: 10, pushForce: 80, typeAttack: TypeOfAttack.Normal});
        }
    }
    

    /**
     * 
     * @param {boolean} isPressed 
     */
    // this function will find the nearest ennemy entity and lock the player rotation to it
    lockToNearestTarget(isPressed) {
        /**@type {Entity | null} */
        this.target = isPressed ? GameObserver.getEntitiesHandler().findClosestEntityTo(this.rootEntity, this.rootEntity.triggerRadius) : null;
        if (this.target) {
            const targetRootMesh = this.target.rootMesh;
            this.setBodyRotation(targetRootMesh.position.x - this.body.position.x, targetRootMesh.position.z - this.body.position.z, 1);
        }
    }

    /**
     * 
     * @param {number} posX
     * @param {number} posY
     * @param {number} interpolation 
     */
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
        const activeWhileLocked = active && isLockedOn;
        /**@type {string} */
		let state = isLockedOn ? StateEnum.Lockin : active ? StateEnum.Walk : StateEnum.Idle;
        if (activeWhileLocked && this.crossStepDirection) state = CrossStepState[this.crossStepDirection];
        if (this.animationSystem) this.animationSystem.updateState(state);
        // Physic
        if ((["Lockin","Walk","Run",].includes(state) || activeWhileLocked)) {
            const force = this.speed; // ajuste
            this.body.velocity.x = this.controls[0] * force * (this.rootEntity.onGround ? 1 : 0.5);
            this.body.velocity.z = this.controls[1] * force * (this.rootEntity.onGround ? 1 : 0.5);
            
            const posX = !this.target ? this.controls[0] : this.target.rootMesh.position.x - this.body.position.x;
            const posY = !this.target ? this.controls[1] : this.target.rootMesh.position.z - this.body.position.z;
            this.setBodyRotation(posX, posY);
        }
        // jump
        // if (this.controls[2] === 1 && this.rootEntity.onGround && !this.isGrabbingObject) {
        //     this.animationSystem.playJumpAction(this.rootEntity.onGround);
        //     this.body.applyImpulse({ x: 0, y: this.jump, z: 0 });
        //     this.rootEntity.onGround = false;
        // }
        if (this.target && this.rootEntity.rootMesh.position.distanceToSquared(this.target.rootMesh.position) > this.rootEntity.triggerRadius) {
            this.target = null;
        }
        if (this.carriedEntity) this.carryEntity();
    }

    gettingHit() {
        this.animationSystem?.playActionByName("Getting_hit");
    }

    dying() {
        this.animationSystem?.playActionByName("Death", LoopOnce, false, false);
        GameObserver.getEntitiesHandler().killEntity(this.rootEntity);
    }

    // this function is run every tick
    tick() {
        this.playerMouvement();
    }
}