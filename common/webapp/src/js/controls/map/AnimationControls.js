import {AnimationClip, AnimationMixer, LoopRepeat} from "three";
import {AniVectorKeyframeTrack} from "@/js/util/animations/keyframe-tracks/AniVectorKeyframeTrack";
import {AniNumberKeyframeTrack} from "@/js/util/animations/keyframe-tracks/AniNumberKeyframeTrack";
import {AniInterpolant} from "@/js/util/animations/interpolants/AniInterpolant";

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
        this.mixers = {};
        this.actions = {};
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
        if (this.actions) {
            for (const action of Object.values(this.actions)) {
                action.reset();
                action.play();
            }
        }
    }

    pause() {
        if (this.actions) {
            for (const action of Object.values(this.actions)) {
                action.halt();
            }
        }
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.mixers) {
            for (const mixer of Object.values(this.mixers)) {
                mixer.update(delta);
            }
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
        } else if (mode === "cine") {
            // localhost:5173/#world:0:0:0:0:0:0:0:0:animation/mode=cine&autoStart=true&showUi=false&data=eyJzY2VuZXMiOlt7ImR1cmF0aW9uIjoxODAwMCwidHJhY2tzIjpbeyJwcm9wZXJ0eSI6Im92ZXJsYXkub3BhY2l0eSIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxfSx7InRpbWUiOjMwMDAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MH0seyJ0aW1lIjoxNTAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjowfSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoibGluZWFyIiwidmFsdWUiOjF9XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5wb3NpdGlvbiIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOnsieCI6NTUuODQwNTAwNTA1Njc1MzYsInkiOjU5LjE3ODUzNjQ2MzE5Mjc4LCJ6IjotMTU1MC4yNTMzNjQ5Mzk1MDQ1fX0seyJ0aW1lIjoxODAwMCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOnsieCI6MzAuODYxNzM0NzM1MjgxNjEsInkiOjExMy4zNTUsInoiOi0xNTQ1LjI5NzEzMTUzNDQ0MzV9fV19LHsicHJvcGVydHkiOiJjYW1lcmEuYW5nbGUiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJjdWJpYyIsInZhbHVlIjowLjg4NDAxNjQxNjY1NzE1NTJ9LHsidGltZSI6MTgwMDAsImludGVycG9sYXRpb24iOiJjdWJpYyIsInZhbHVlIjoxLjQwMzcxNTQyNTYzMDg2OTV9XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5yb3RhdGlvbiIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOjEuNTgzMzYyODM1MjQ4OTc5NX0seyJ0aW1lIjoxODAwMCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOjEuNTc4OTQ4NjQ5Njg3MTI0M31dfSx7InByb3BlcnR5IjoiY2FtZXJhLmRpc3RhbmNlIiwia2V5ZnJhbWVzIjpbeyJ0aW1lIjowLCJpbnRlcnBvbGF0aW9uIjoiY3ViaWMiLCJ2YWx1ZSI6MjM4LjE0ODA2ODc0NjkzNDY1fSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoiY3ViaWMiLCJ2YWx1ZSI6NX1dfV19LHsiZHVyYXRpb24iOjEwMDAwLCJ0cmFja3MiOlt7InByb3BlcnR5Ijoib3ZlcmxheS5vcGFjaXR5Iiwia2V5ZnJhbWVzIjpbeyJ0aW1lIjowLCJpbnRlcnBvbGF0aW9uIjoibGluZWFyIiwidmFsdWUiOjF9LHsidGltZSI6MjAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjowfSx7InRpbWUiOjgwMDAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MH0seyJ0aW1lIjoxMDAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxfV19LHsicHJvcGVydHkiOiJjYW1lcmEucG9zaXRpb24iLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJjdWJpYyIsInZhbHVlIjp7IngiOjM4LjEzMjQxNTc2OTE4NTgyNiwieSI6MTEyLjMzNDI1NjI5ODI5MTgsInoiOi0xNTc1LjIyODQwMzIxMDAyN319LHsidGltZSI6MTAwMDAsImludGVycG9sYXRpb24iOiJjdWJpYyIsInZhbHVlIjp7IngiOjM4LjEzMjQxNTc2OTE4NTgyNiwieSI6MTEyLjMzNDI1NjI5ODI5MTgsInoiOi0xNTI1LjgyNjE2ODMwMzk1MTF9fV19LHsicHJvcGVydHkiOiJjYW1lcmEuYW5nbGUiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MS40NTUzNjM1MzIwNTk1MTQ0fV19LHsicHJvcGVydHkiOiJjYW1lcmEucm90YXRpb24iLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MS41NjczMjgxMDc2NTU0MzUzfV19LHsicHJvcGVydHkiOiJjYW1lcmEuZGlzdGFuY2UiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MTUuOH1dfV19XX0=

            this.init = {
                params: {
                    mode: mode,
                    autoStart: parsedParams.get("autoStart") === "true",
                    showUi: parsedParams.get("showUi") === "true",
                    data: parsedParams.get("data")
                }
            };
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
            if (this.init.params.mode === "rotate") {
                this.init.animations = this._initFromObjectRotateMode(this.init.params);
            } else if (this.init.params.mode === "cine") {
                this.init.animations = this._initFromCineJson(this.init.params);
            }

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
        if (this.mixers) {
            for (const mixer of Object.values(this.mixers)) {
                mixer.stopAllAction();
            }
        }

        const camera = this._mapCamera(animations);
        const sunLight = this._mapSunLight(animations);
        const ambientLight = this._mapAmbientLight(animations);

        this.mixers = {
            camera: camera.mixer,
            sunLight: sunLight.mixer,
            ambientLight: ambientLight.mixer,
        }

        this.actions = {
            camera: camera.action,
            sunLight: sunLight.action,
            ambientLight: ambientLight.action,
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
            const sortedKeyFrameValues = this._mapToSortedKeyFrameValues(animations, key, defaults[key]);

            const interpolant = (tr, result) => new AniInterpolant(
                sortedKeyFrameValues.map(kf => kf.interpolation),
                tr.times,
                tr.values,
                tr.getValueSize(),
                result
            );

            const targetProperty = ((prop) => {
                switch (prop) {
                    case "camera.position":
                        return ".position";
                    case "overlay.opacity":
                        return ".backdropOpacity";
                    case "camera.angle":
                        return ".angle";
                    case "camera.rotation":
                        return ".rotation";
                    case "camera.ortho":
                        return ".ortho";
                    case "camera.distance":
                        return ".distance";
                    default:
                        throw new Error(`Unknown property: ${prop}`);
                }
            })(key);

            let keyframeTrack = null;

            if (["camera.position"].indexOf(key) >= 0) {
                keyframeTrack = new AniVectorKeyframeTrack(
                    targetProperty,
                    sortedKeyFrameValues.map(kf => kf.time),
                    sortedKeyFrameValues.flatMap(kf => [kf.value.x, kf.value.y, kf.value.z]),
                    interpolant,
                );
            } else if (["overlay.opacity", "camera.angle", "camera.rotation", "camera.ortho", "camera.distance"].indexOf(key) >= 0) {
                keyframeTrack = new AniNumberKeyframeTrack(
                    targetProperty,
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

    /**
     * @param {Animations} animations
     * @private
     */
    _mapSunLight(animations) {
        const defaults = {
            "light.sun": 1
        }

        const tracks = [];

        for (const key in defaults) {
            const sortedKeyFrameValues = this._mapToSortedKeyFrameValues(animations, key, defaults[key]);

            const interpolant = (tr, result) => new AniInterpolant(
                sortedKeyFrameValues.map(kf => kf.interpolation),
                tr.times,
                tr.values,
                tr.getValueSize(),
                result
            );

            const targetProperty = ((prop) => {
                switch (prop) {
                    case "light.sun":
                        return ".value";
                    default:
                        throw new Error(`Unknown property: ${prop}`);
                }
            })(key);

            let keyframeTrack = null;

            if (["light.sun"].indexOf(key) >= 0) {
                keyframeTrack = new AniNumberKeyframeTrack(
                    targetProperty,
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
        const mixer = new AnimationMixer(this.manager.mapViewer.data.uniforms.sunlightStrength);

        const action = mixer.clipAction(clips);
        action.setLoop(LoopRepeat);
        action.startAt(0);                // delay in seconds
        action.clampWhenFinished = true;

        return {
            mixer,
            action,
        };
    }

    /**
     * @param {Animations} animations
     * @private
     */
    _mapAmbientLight(animations) {
        const defaults = {
            "light.ambient": 0.1
        }

        const tracks = [];

        for (const key in defaults) {
            const sortedKeyFrameValues = this._mapToSortedKeyFrameValues(animations, key, defaults[key]);

            const interpolant = (tr, result) => new AniInterpolant(
                sortedKeyFrameValues.map(kf => kf.interpolation),
                tr.times,
                tr.values,
                tr.getValueSize(),
                result
            );

            const targetProperty = ((prop) => {
                switch (prop) {
                    case "light.ambient":
                        return ".value";
                    default:
                        throw new Error(`Unknown property: ${prop}`);
                }
            })(key);

            let keyframeTrack = null;

            if (["light.ambient"].indexOf(key) >= 0) {
                keyframeTrack = new AniNumberKeyframeTrack(
                    targetProperty,
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
        const mixer = new AnimationMixer(this.manager.mapViewer.data.uniforms.ambientLight);

        const action = mixer.clipAction(clips);
        action.setLoop(LoopRepeat);
        action.startAt(0);                // delay in seconds
        action.clampWhenFinished = true;

        console.log(tracks);

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

    _initFromCineJson(params) {
        const {data} = params;
        return JSON.parse(atob(data));
    }

    _mapToSortedKeyFrameValues(animations, key, defaultsKey) {
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
}
