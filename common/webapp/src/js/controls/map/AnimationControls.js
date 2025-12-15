import {AnimationClip, AnimationMixer, LoopRepeat} from "three";
import {AniVectorKeyframeTrack} from "@/js/util/animations/keyframe-tracks/AniVectorKeyframeTrack";
import {AniNumberKeyframeTrack} from "@/js/util/animations/keyframe-tracks/AniNumberKeyframeTrack";
import {AniInterpolant} from "@/js/util/animations/interpolants/AniInterpolant";
import {RefMap} from "@/js/util/animations/ref-map";

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
            // localhost:5173/#world:0:0:0:0:0:0:0:0:animation/mode=cine&autoStart=true&showUi=false&data=eyJzY2VuZXMiOlt7ImR1cmF0aW9uIjoxODAwMCwidHJhY2tzIjpbeyJwcm9wZXJ0eSI6Im92ZXJsYXkub3BhY2l0eSIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxfSx7InRpbWUiOjMwMDAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MH0seyJ0aW1lIjoxNTAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjowfSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoibGluZWFyIiwidmFsdWUiOjF9XX0seyJwcm9wZXJ0eSI6ImxpZ2h0LnN1biIsImtleWZyYW1lcyI6W3sidGltZSI6MTAwMDAsImludGVycG9sYXRpb24iOiJjdWJpYyIsInZhbHVlIjoxfSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoiY3ViaWMiLCJ2YWx1ZSI6MH1dfSx7InByb3BlcnR5IjoiY2FtZXJhLnBvc2l0aW9uIiwia2V5ZnJhbWVzIjpbeyJ0aW1lIjowLCJpbnRlcnBvbGF0aW9uIjoiY3ViaWMiLCJ2YWx1ZSI6eyJ4Ijo1NS44NDA1MDA1MDU2NzUzNiwieSI6NTkuMTc4NTM2NDYzMTkyNzgsInoiOi0xNTUwLjI1MzM2NDkzOTUwNDV9fSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoiY3ViaWMiLCJ2YWx1ZSI6eyJ4IjozMC44NjE3MzQ3MzUyODE2MSwieSI6MTEzLjM1NSwieiI6LTE1NDUuMjk3MTMxNTM0NDQzNX19XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5hbmdsZSIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOjAuODg0MDE2NDE2NjU3MTU1Mn0seyJ0aW1lIjoxODAwMCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOjEuNDAzNzE1NDI1NjMwODY5NX1dfSx7InByb3BlcnR5IjoiY2FtZXJhLnJvdGF0aW9uIiwia2V5ZnJhbWVzIjpbeyJ0aW1lIjowLCJpbnRlcnBvbGF0aW9uIjoiY3ViaWMiLCJ2YWx1ZSI6MS41ODMzNjI4MzUyNDg5Nzk1fSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoiY3ViaWMiLCJ2YWx1ZSI6MS41Nzg5NDg2NDk2ODcxMjQzfV19LHsicHJvcGVydHkiOiJjYW1lcmEuZGlzdGFuY2UiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJjdWJpYyIsInZhbHVlIjoyMzguMTQ4MDY4NzQ2OTM0NjV9LHsidGltZSI6MTgwMDAsImludGVycG9sYXRpb24iOiJjdWJpYyIsInZhbHVlIjo1fV19XX0seyJkdXJhdGlvbiI6MTAwMDAsInRyYWNrcyI6W3sicHJvcGVydHkiOiJvdmVybGF5Lm9wYWNpdHkiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MX0seyJ0aW1lIjoyMDAwLCJpbnRlcnBvbGF0aW9uIjoibGluZWFyIiwidmFsdWUiOjB9LHsidGltZSI6ODAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjowfSx7InRpbWUiOjEwMDAwLCJpbnRlcnBvbGF0aW9uIjoibGluZWFyIiwidmFsdWUiOjF9XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5wb3NpdGlvbiIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOnsieCI6MzguMTMyNDE1NzY5MTg1ODI2LCJ5IjoxMTIuMzM0MjU2Mjk4MjkxOCwieiI6LTE1NzUuMjI4NDAzMjEwMDI3fX0seyJ0aW1lIjoxMDAwMCwiaW50ZXJwb2xhdGlvbiI6ImN1YmljIiwidmFsdWUiOnsieCI6MzguMTMyNDE1NzY5MTg1ODI2LCJ5IjoxMTIuMzM0MjU2Mjk4MjkxOCwieiI6LTE1MjUuODI2MTY4MzAzOTUxMX19XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5hbmdsZSIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxLjQ1NTM2MzUzMjA1OTUxNDR9XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5yb3RhdGlvbiIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxLjU2NzMyODEwNzY1NTQzNTN9XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5kaXN0YW5jZSIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxNS44fV19XX1dfQ==

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

        const {mixers, actions} = this._mapMixersActions(animations);

        this.mixers = mixers;
        this.actions = actions;
    }

    /**
     * @param {Animations} animations
     * @private
     */
    _mapMixersActions(animations) {
        const propConfig = this._propConfig();
        const targets = {};

        const refMap = new RefMap();

        for (const key in propConfig) {
            const item = propConfig[key];
            const sortedKeyFrameValues = this._mapToSortedKeyFrameValues(animations, key, item.default);

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

        const mixers = {};
        const actions = {};

        for (const [key, target] of Object.entries(targets)) {
            const clips = new AnimationClip('Action-Camera', durationTotal, target.tracks);
            const mixer = new AnimationMixer(target.target);

            const action = mixer.clipAction(clips);
            action.setLoop(LoopRepeat);
            action.startAt(0);                // delay in seconds
            action.clampWhenFinished = true;

            mixers[key] = mixer;
            actions[key] = action;
        }

        return {
            mixers,
            actions,
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

    _propConfig() {
        return {
            "camera.position": {target: this.manager, property: ".position", type: 'vector', default: {x: 0, y: 0, z: 0}},
            "overlay.opacity": {target: this.manager, property: ".backdropOpacity", type: 'number', default: 0},
            "camera.angle": {target: this.manager, property: ".angle", type: 'number', default: 0},
            "camera.rotation": {target: this.manager, property: ".rotation", type: 'number', default: 0},
            "camera.ortho": {target: this.manager, property: ".ortho", type: 'number', default: 0},
            "camera.distance": {target: this.manager, property: ".distance", type: 'number', default: 0},
            "light.sun": {target: this.manager.mapViewer.data.uniforms.sunlightStrength, property: ".value", type: 'number', default: 1},
            "light.ambient": {target: this.manager.mapViewer.data.uniforms.ambientLight, property: ".value", type: 'number', default: 0.1},
        };
    }
}
