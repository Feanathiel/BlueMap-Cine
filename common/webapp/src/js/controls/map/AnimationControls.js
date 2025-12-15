import {AnimationClip, AnimationMixer, LoopRepeat, Vector3} from "three";
import {AniVectorKeyframeTrack} from "@/js/util/AniVectorKeyframeTrack";
import {AniNumberKeyframeTrack} from "@/js/util/AniNumberKeyframeTrack";
import {AniInterpolant} from "@/js/util/AniInterpolant";

/**
 * @typedef Animations
 * @property {Scene[]} scenes
 */

/**
 * @typedef Scene
 * @property {number} duration
 * @property {Track[]} tracks
 */

/**
 * @typedef Track
 * @property {"camera.position" | "overlay.opacity" | "camera.angle" | "camera.rotation" | "camera.ortho" | "camera.distance"} property
 * @property {NumberKeyFrame[] | VectorKeyFrame[]} keyframes
 */

/**
 * @typedef KeyFrame
 * @property {number} time
 */

/**
 * @typedef NumberKeyFrame
 * @extends KeyFrame
 * @property {number} value
 */

/**
 * @typedef VectorKeyFrame
 * @extends KeyFrame
 * @property {number} value.x
 * @property {number} value.y
 * @property {number} value.z
 */


export class AnimationControls {
    /**
     * @param rootElement {Element}
     */
    constructor(rootElement) {
        this.rootElement = rootElement;

        this.data = {};

        /** @type {ControlsManager} */
        this.manager = null;

        this.init = null;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;
        this.rootElement.addEventListener("contextmenu", this.onContextMenu);
    }

    stop() {
        this.pause();

        this.rootElement.removeEventListener("contextmenu", this.onContextMenu);
    }

    play() {
        if (this.actions?.camera) {
            this.actions.camera.reset();
            this.actions.camera.play();
        }
    }

    pause() {
        if (this.actions?.camera) {
            this.actions.camera.halt();
        }
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.mixers?.camera) {
            this.mixers.camera.update(delta);
        }
    }

    reset(animationParams) {
        const parsedParams = new URLSearchParams(animationParams ?? "");

        const mode = parsedParams.get("mode");
        if (mode === "rotate") {
            // localhost:5173/#world:44:121:-1545:60:0:1.05:0:0:animation/mode=rotate&autoStart=true&duration=180000&showUi=true

            this.init = {
                params: {
                    mode: mode,
                    autoStart: parsedParams.get("autoStart") === "true",
                    showUi: parsedParams.get("showUi") === "true",
                    duration: parseInt(parsedParams.get("duration"))
                }
            }
        }
    }

    getPageAddressParameters() {
        if (this.init) {
            const parsedParams = new URLSearchParams();

            Object.keys(this.init.params).forEach(key => {
                parsedParams.set(key, this.init.params[key]);
            })


            return "/" + parsedParams.toString();
        }

        return "";
    }

    onContextMenu = evt => {
        evt.preventDefault();
    }

    dumpCamera() {
        console.log("camera dump", {
            position: {
                x: this.manager.data.position.x,
                y: this.manager.data.position.y,
                z: this.manager.data.position.z
            },
            angle: this.manager.data.angle,
            rotation: this.manager.data.rotation,
            ortho: this.manager.camera.data.ortho,
            distance: this.manager.camera.data.distance,
        });
    }

    postInit() {
        if (this.init && this.manager) {
            this.init.animations = this._initFromObjectRotateMode(this.init.params);
            this._loadFromInit(this.init.animations);

            if (this.init.params.autoStart) {
                this.play();
            }

            this.manager.data.showUi = this.init.params.showUi;
        }
    }

    /**
     * @param {Animations} animations
     * @private
     */
    _loadFromInit(animations) {
        if (this.mixers?.camera) {
            // For some reason this causes low-res
            this.mixers.camera.stopAllAction();
        }

        const camera = this._mapCamera(animations);

        this.mixers = {
            camera: camera.mixer
        }

        this.actions = {
            camera: camera.action
        };
    }

    /**
     * @param {Animations} animations
     * @private
     */
    _mapCamera(animations) {
        const defaults = {
            "camera.position": { x: 0, y: 0, z: 0 },
            "overlay.opacity": 0,
            "camera.angle": 0,
            "camera.rotation": 0,
            "camera.ortho": 0,
            "camera.distance": 0,
        }

        const tracks = [];

        for (const key in defaults) {
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

                        if (minKeyFrameValue === null || minKeyFrameValue.time < keyFrameValue.time) {
                            minKeyFrameValue = keyFrameValue;
                        }

                        if (maxKeyFrameValue === null || minKeyFrameValue.time > keyFrameValue.time) {
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
                            value: defaults[key]
                        });
                    }
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
                            value: defaults[key]
                        });
                    }
                }

                durationOffset += scene.duration;
            }

            const sortedKeyFrameValues = keyFrameValues.toSorted((a, b) => a.time - b.time);

            const interpolant = (tr, result) => new AniInterpolant(
                sortedKeyFrameValues.map(kf => kf.interpolation),
                tr.times,
                tr.values,
                tr.getValueSize(),
                result
            );

            const targetProp = this._mapToTargetProperty(key);

            let keyframeTrack = null;

            if (["camera.position"].indexOf(key) >= 0) {
                keyframeTrack = new AniVectorKeyframeTrack(
                    targetProp.property,
                    sortedKeyFrameValues.map(kf => kf.time),
                    sortedKeyFrameValues.flatMap(kf => [kf.value.x, kf.value.y, kf.value.z]),
                    interpolant,
                );
            } else if (["overlay.opacity", "camera.angle", "camera.rotation", "camera.ortho", "camera.distance"].indexOf(key) >= 0) {
                keyframeTrack = new AniNumberKeyframeTrack(
                    targetProp.property,
                    sortedKeyFrameValues.map(kf => kf.time),
                    sortedKeyFrameValues.map(kf => kf.value),
                    interpolant,
                );
            } else {
                throw new Error(`Unknown property: ${key}`);
            }

            tracks.push(keyframeTrack);
        }

        const durationTotal = animations.scenes.reduce((prev, curr) => prev + curr.duration, 0);

        const clips = new AnimationClip('Action-Camera', durationTotal, tracks);
        const mixer = new AnimationMixer(this.manager);

        const action = mixer.clipAction(clips);
        action.setLoop(LoopRepeat);
        action.startAt(0);                // delay in seconds
        action.clampWhenFinished = true;

        return {
            mixer,
            action,
        };
    }

    _initFromObjectRotateMode(params) {
        return {
            scenes: [
                {
                    duration: params.duration,
                    tracks: [
                        {
                            property: 'camera.position',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: this.manager.position.clone(),
                                },
                            ]
                        },

                        {
                            property: 'camera.angle',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: this.manager.angle
                                },
                            ]
                        },

                        {
                            property: 'camera.rotation',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: 0
                                },
                                {
                                    time: params.duration,
                                    interpolation: 'linear',
                                    value: Math.PI * 2
                                },
                            ]
                        },

                        {
                            property: 'camera.distance',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: this.manager.distance
                                },
                            ]
                        },
                    ]
                },
            ],
        };
    }

    _mapToTargetProperty(prop) {
        switch (prop) {
            case "camera.position":
                return {target: 'camera', property: ".position"};
            case "overlay.opacity":
                return {target: 'camera', property: ".backdropOpacity"};
            case "camera.angle":
                return {target: 'camera', property: ".angle"};
            case "camera.rotation":
                return {target: 'camera', property: ".rotation"};
            case "camera.ortho":
                return {target: 'camera', property: ".ortho"};
            case "camera.distance":
                return {target: 'camera', property: ".distance"};
            default:
                throw new Error(`Unknown property: ${prop}`);
        }
    }
}
