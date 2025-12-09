import {Interpolant, LinearInterpolant, CubicInterpolant} from "three";

export class AniInterpolant extends Interpolant {
    constructor(interpolantIds, parameterPositions, sampleValues, sampleSize, resultBuffer) {
        super(parameterPositions, sampleValues, sampleSize, resultBuffer);

        this.interpolantIds = interpolantIds;
        this.interpolants = {
            linear: new LinearInterpolant(parameterPositions, sampleValues, sampleSize),
            cubic: new CubicInterpolant(parameterPositions, sampleValues, sampleSize),
        };
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