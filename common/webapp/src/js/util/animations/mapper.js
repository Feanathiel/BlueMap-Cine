import {RefMap} from "@/js/util/animations/ref-map";
import {AniInterpolant} from "@/js/util/animations/interpolants/AniInterpolant";
import {AniNumberKeyframeTrack} from "@/js/util/animations/keyframe-tracks/AniNumberKeyframeTrack";
import {AniVectorKeyframeTrack} from "@/js/util/animations/keyframe-tracks/AniVectorKeyframeTrack";
import {AnimationClip, AnimationMixer, LoopRepeat} from "three";

/**
 * @param {Animations} animations
 * @private
 */
export function mapMixersActions(animations, config) {
    const targets = {};
    const refMap = new RefMap();

    for (const key in config) {
        const item = config[key];
        const sortedKeyFrameValues = _mapToSortedKeyFrameValues(animations, key, item.default);

        const interpolant = (tr, result) => new AniInterpolant(
            sortedKeyFrameValues.map(kf => kf.interpolation),
            tr.times,
            tr.values,
            tr.getValueSize(),
            result
        );

        let keyframeTrack = null;

        if (item.type === "number") {
            keyframeTrack = new AniNumberKeyframeTrack(
                item.property,
                sortedKeyFrameValues.map(kf => kf.time),
                sortedKeyFrameValues.map(kf => kf.value),
                interpolant,
            );
        } else if (item.type === "vector") {
            keyframeTrack = new AniVectorKeyframeTrack(
                item.property,
                sortedKeyFrameValues.map(kf => kf.time),
                sortedKeyFrameValues.flatMap(kf => [kf.value.x, kf.value.y, kf.value.z]),
                interpolant,
            );
        } else {
            throw new Error(`Unknown property: ${key}`);
        }

        const id = refMap.getId(item.target);

        if (!targets[id]) {
            targets[id] = {
                target: item.target,
                tracks: [],
            };
        }

        targets[id].tracks.push(keyframeTrack);
    }

    const durationTotal = animations.scenes.reduce((prev, curr) => prev + curr.duration, 0);

    const mixerActions = [];

    for (const target of Object.values(targets)) {
        const clips = new AnimationClip('Action-Camera', durationTotal, target.tracks);
        const mixer = new AnimationMixer(target.target);

        const action = mixer.clipAction(clips);
        action.setLoop(LoopRepeat);
        action.startAt(0);                // delay in seconds
        action.clampWhenFinished = true;

        mixerActions.push({
            mixer,
            action,
        });
    }

    return mixerActions;
}

function _mapToSortedKeyFrameValues(animations, key, defaultsKey) {
    const keyFrameValues = [];

    let durationOffset = 0;

    for (const scene of animations.scenes) {
        let minKeyFrameValue = null;
        let maxKeyFrameValue = null;
        let containsSceneStart = false;
        let containsSceneEnd = false;

        for (const track of scene.tracks) {
            if (track.property !== key) {
                continue;
            }

            for (const keyFrame of track.keyframes) {
                let time = keyFrame.time;

                if (keyFrame.time === 0) {
                    containsSceneStart = true;
                }

                if (keyFrame.time === scene.duration) {
                    containsSceneEnd = true;
                    time = keyFrame.time -1;
                }

                const keyFrameValue = {
                    interpolation: keyFrame.interpolation,
                    time: time + durationOffset,
                    value: keyFrame.value,
                };

                if (minKeyFrameValue === null || minKeyFrameValue.time > keyFrameValue.time) {
                    minKeyFrameValue = keyFrameValue;
                }

                if (maxKeyFrameValue === null || maxKeyFrameValue.time < keyFrameValue.time) {
                    maxKeyFrameValue = keyFrameValue;
                }

                keyFrameValues.push(keyFrameValue);
            }
        }

        if (!containsSceneStart) {
            if (minKeyFrameValue) {
                keyFrameValues.push({
                    interpolation: 'linear',
                    time: durationOffset,
                    value: minKeyFrameValue.value
                });
            } else {
                keyFrameValues.push({
                    interpolation: 'linear',
                    time: durationOffset,
                    value: defaultsKey
                });
            }
        }

        // Fix the cubic keyframes, since they tween over an additional keyframe
        if (minKeyFrameValue && minKeyFrameValue.interpolation === "cubic") {
            keyFrameValues.push({
                interpolation: 'cubic',
                time: durationOffset+1,
                value: minKeyFrameValue.value
            });
        }

        if (maxKeyFrameValue && maxKeyFrameValue.interpolation === "cubic") {
            keyFrameValues.push({
                interpolation: 'cubic',
                time: durationOffset + scene.duration - 2,
                value: maxKeyFrameValue.value
            });
        }

        if (!containsSceneEnd) {
            if (maxKeyFrameValue) {
                keyFrameValues.push({
                    interpolation: 'linear',
                    time: durationOffset + scene.duration - 1,
                    value: maxKeyFrameValue.value
                });
            } else {
                keyFrameValues.push({
                    interpolation: 'linear',
                    time: durationOffset + scene.duration - 1,
                    value: defaultsKey
                });
            }
        }

        durationOffset += scene.duration;
    }

    return keyFrameValues.toSorted((a, b) => a.time - b.time);
}
