import {Interpolant} from "three";
import {AniEasingInterpolant} from "@/js/util/animations/interpolants/AniEasingInterpolant";
import {EasingFunctions} from "@/js/util/Utils";

export class AniInterpolant extends Interpolant {
    constructor(interpolantIds, parameterPositions, sampleValues, sampleSize, resultBuffer) {
        super(parameterPositions, sampleValues, sampleSize, resultBuffer);

        this.interpolantIds = interpolantIds;
        this.interpolants = {};

        for (const [key, func] of Object.entries(EasingFunctions)) {
            this.interpolants[key] = new AniEasingInterpolant(parameterPositions, sampleValues, sampleSize, undefined, func);
        }
    }

    evaluate(t) {
        return super.evaluate(t);
    }

    copySampleValue_( index ) {
        const interpolantId = this.interpolantIds[index];
        const interpolant = this.interpolants[interpolantId];

        interpolant.resultBuffer = this.resultBuffer;
        return interpolant.copySampleValue_(index);
    }

    interpolate_(i1, t0, t, t1) {
        const interpolantId = this.interpolantIds[i1];
        const interpolant = this.interpolants[interpolantId];

        interpolant.resultBuffer = this.resultBuffer;
        return interpolant.interpolate_(i1, t0, t, t1);
    }

    intervalChanged_(i1, t0, t1) {
        const interpolantId = this.interpolantIds[i1];
        const interpolant = this.interpolants[interpolantId];

        interpolant.intervalChanged_(i1, t0, t1);
    }
}