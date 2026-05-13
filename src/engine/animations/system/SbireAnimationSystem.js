import { AnimationUtils, LoopOnce, LoopPingPong } from "three";
import { addClipToProvider, getClipFromProvider, removeClipFromProvider } from "../provider/animationProvider";
import SharedAnimationSystem from "./base/SharedAnimationSystem";
import { ArmatureLayerEnum } from "../../../types/enums";


export default class SbireAnimationSystem extends SharedAnimationSystem {
    /**
     * @param {AnimationMixer} mixer
     * @param {AnimationClip[]} animations
     */
    constructor(mixer, animations) {
        super("Sbire", mixer, animations);
        this.initSbireActions();
    }

    initSbireActions() {
        const liftedClip = getClipFromProvider(this.objectName, "Lifted");

        const clipList = [
            AnimationUtils.subclip(liftedClip, "Getting_Lifted", 0, 14),
            AnimationUtils.subclip(liftedClip, "Still_Lifted", 14, 24),
        ];

        clipList.forEach((clip)=>{
            addClipToProvider(clip, this.objectName, clip.name);
        });

        removeClipFromProvider(this.objectName, "Lifted");
    }

    lifted() {
        const initLiftedAction = this.mixer.clipAction(getClipFromProvider(this.objectName, "Getting_Lifted", ArmatureLayerEnum.All));
        this.playAction(initLiftedAction, LoopOnce, true, false);

        // when the first charging punch animation finished, we play this function
        const onFinishInitLifted = (/** @type {{ action: any; }} */ e) => {
            if (e.action === initLiftedAction) {
                this.mixer.removeEventListener('finished', onFinishInitLifted); // we remove the listener
                const holdLiftedAction = this.mixer.clipAction(getClipFromProvider(this.objectName, "Still_Lifted", ArmatureLayerEnum.All));
                holdLiftedAction.reset().setLoop(LoopPingPong, Infinity).setEffectiveWeight(1).play();
                this.crossFade(initLiftedAction, holdLiftedAction, 0.2);
                this.tempAction = holdLiftedAction;
            }
        };
        this.mixer.addEventListener('finished', onFinishInitLifted);
    }
}