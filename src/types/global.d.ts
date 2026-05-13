import type {
  AnimationClip as ThreeAnimationClip,
  AnimationAction as ThreeAnimationAction,
  AnimationMixer as ThreeAnimationMixer,
  AnimationMixerEventMap as ThreeAnimationMixerEventMap,
  AnimationActionLoopStyles as ThreeAnimationActionLoopStyles,
  Mesh as ThreeMesh,
  Group as ThreeGroup,
  Object3D as ThreeObject3D
} from 'three';

import type { 
    Body as GlobalCannonBody, 
    CollideEvent as CannonCollideEvent 
} from 'cannon-es';

import type GameObjectClass from '../game/gameObjects/base/GameObject';
import type EntityClass from '../game/gameObjects/entities/base/Entity';
import type HitboxClass from '../engine/components/Hitbox';
import type InputSystemClass from '../engine/systems/InputSystem';
import type WorldSystemClass from '../engine/systems/WorldSystem';
import type ControllerClass from '../game/controllers/base/Controller';
import type EnemyControllerClass from '../game/controllers/base/EnemyController';
import type PlayerControllerClass from '../game/controllers/PlayerController';
import type SbireControllerClass from '../game/controllers/SbireController';
import type LayerAnimationSystemClass from '../engine/animations/system/base/LayerAnimationSystem';
import type SharedAnimationSystemClass from '../engine/animations/system/base/SharedAnimationSystem';
import type PlayerAnimationSystemClass from '../engine/animations/system/PlayerAnimationSystem';
import type SbireAnimationSystemClass from '../engine/animations/system/SbireAnimationSystem';


export {}

declare const StateEnum: Readonly<{
    Idle: "Idle",
    Walk: "Walk",
    Running: "Running",
    Stunned: "Stunned",
    Cross_steps: "Cross_steps",
    CrossStep_left: "CrossStep_left",
    CrossStep_right: "CrossStep_right",
    CrossStep_back: "CrossStep_back",
    CrossStep_front: "CrossStep_front",
    Lockin: "Lockin",
}>;

declare const EntityStatut: Readonly<{
    Active: "Active",
    Stunned: "Stunned",
    Lifted: "Lifted",
    Throwed: "Throwed",
    Pushed: "Pushed",
    Dead: "Dead"
}>;

declare module "*.glb" {
    const src: string;
    export default src;
}

declare module "*.gltf" {
    const src: string;
    export default src;
}

declare global {
    type AnimationClip = ThreeAnimationClip
    type AnimationAction = ThreeAnimationAction
    type AnimationMixer = ThreeAnimationMixer
    type AnimationMixerEventMap = ThreeAnimationMixerEventMap
    type AnimationActionLoopStyles = ThreeAnimationActionLoopStyles
    type CollideEvent = CannonCollideEvent
    type Mesh = ThreeMesh
    type Group = ThreeGroup
    type Object3D = ThreeObject3D

    type GameObject = GameObjectClass;
    type Entity = EntityClass;
    type Hitbox = HitboxClass;
    type InputSystem = InputSystemClass;
    type WorldSystem = WorldSystemClass;
    type Controller = ControllerClass;
    type EnemyController = EnemyControllerClass;
    type PlayerController = PlayerControllerClass;
    type SbireController = SbireControllerClass;
    type LayerAnimationSystem = LayerAnimationSystemClass;
    type SharedAnimationSystem = SharedAnimationSystemClass;
    type PlayerAnimationSystem = PlayerAnimationSystemClass;
    type SbireAnimationSystem = SbireAnimationSystemClass;
    type EntityStatutType =
    typeof EntityStatut[keyof typeof EntityStatut];
    type StateEnumType = typeof StateEnum[keyof typeof StateEnum];
    type CrossStepDirection =
    | "left"
    | "right"
    | "back"
    | "front";


    interface CannonBody extends GlobalCannonBody {
        isGround?: boolean,
        gameObjectID?: string,
        entityType?: string
    }

    interface GameAnimationAction extends AnimationAction {
        layerBodyMask?: string
    }

    interface AnimationFinishedEvent {
        action: GameAnimationAction
        direction: number
    }

    interface DamageData {
        damage: number
        pushForce?: number
        typeAttack?: string
    }

    type LayerClips = Record<
        string,
        AnimationClip
    >

    type LayerActions = Record<
        string,
        GameAnimationAction[]
    >

    type ActionMap = Map<
        string,
        LayerClips
    >

    type AnimationProvider = Record<
        string,
        ActionMap
    >

}

export {}