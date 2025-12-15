import {Interpolant} from "three";

export class AniEasingInterpolant extends Interpolant {
    constructor( parameterPositions, sampleValues, sampleSize, resultBuffer, easingFunction ) {
        super( parameterPositions, sampleValues, sampleSize, resultBuffer );
        this.easingFunction = easingFunction;
    }

    interpolate_( i1, t0, t, t1 ) {
        const result = this.resultBuffer,
            values = this.sampleValues,
            stride = this.valueSize,

            offset1 = i1 * stride,
            offset0 = offset1 - stride,

            weight1 = ( t - t0 ) / ( t1 - t0 );

        const e1 = this.easingFunction(weight1);
        const e0 = 1-e1;

        for ( let i = 0; i !== stride; ++ i ) {
            result[ i ] = values[ offset0 + i ] * e0 + values[ offset1 + i ] * e1;
        }

        return result;
    }
}