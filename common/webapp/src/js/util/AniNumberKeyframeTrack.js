import {NumberKeyframeTrack} from "three";

export class AniNumberKeyframeTrack extends NumberKeyframeTrack {
    setInterpolation(interpolation) {
        if (typeof interpolation === "function") {
            super.createInterpolant = (result) => interpolation(this, result);
        } else {
            return super.setInterpolation(interpolation);
        }

        return this;
    }
}