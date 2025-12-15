import {VectorKeyframeTrack} from "three";

export class AniVectorKeyframeTrack extends VectorKeyframeTrack {
    setInterpolation( interpolation ) {
        if (typeof interpolation === "function") {
            super.createInterpolant = (result) => interpolation(this, result);
        } else {
            return super.setInterpolation(interpolation);
        }

        return this;
    }
}



