// represent all the states, it is used to separate the state action from the gesture action
export const StateEnum = Object.freeze({
    "Idle": "Idle",
    "Walk": "Walk",
    "Running": "Running",
    "Stunned": "Stunned",
    "Cross_steps": "Cross_steps",
    "CrossStep_left": "CrossStep_left",
    "CrossStep_right": "CrossStep_right",
    "CrossStep_back": "CrossStep_back",
    "CrossStep_front": "CrossStep_front",
    "Lockin": "Lockin",
});

// represent the state depending of the direction of the cross steps
export const CrossStepState = {
    left: StateEnum.CrossStep_left,
    right: StateEnum.CrossStep_right,
    back: StateEnum.CrossStep_back,
    front: StateEnum.CrossStep_front,
};

// represent the differents type of animation layer in a body
export const ArmatureLayerEnum = Object.freeze({
    "All": "All",
    "Upper": "Upper",
    "Lower": "Lower",
    "Both": "Both"
});

// represent the different type of hitbox
export const HitboxModeEnum = Object.freeze({
    "Passive": "Passive",
    "Active": "Active"
});

// represent the different type of Object in the game
export const ObserverObjectEnum = Object.freeze({
    "World": "World",
    "Props": "Props",
    "Entity": "Entity",
    "Player": "Player",
    "Item": "Item",
})

// represent the entity status
export const EntityStatut = Object.freeze({
    "Active": "Active",
    "Stunned": "Stunned",
    "Lifted": "Lifted",
    "Throwed": "Throwed",
    "Pushed": "Pushed",
    "Dead": "Dead"
});

export const TypeOfAttack = Object.freeze({
    "Normal": "Normal",
    "Charged": "Charged",
    "ThrowedEntity": "ThrowedEntity"
})

export const TypeOfThrown = Object.freeze({
    "Throw" : "Throw",
    "PunchPush" : "PunchPush"
})