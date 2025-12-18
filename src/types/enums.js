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
    "Dead": "Dead"
});

// represent the differents type of animation layer in a body
export const ArmatureLayerEnum = Object.freeze({
    "All": "All",
    "Upper": "Upper",
    "Lower": "Lower",
    "Both": "Both"
});