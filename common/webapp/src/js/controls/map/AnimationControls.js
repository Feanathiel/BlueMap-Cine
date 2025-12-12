import {AnimationClip, AnimationMixer, LoopOnce, LoopRepeat} from "three";
import {AniVectorKeyframeTrack} from "@/js/util/AniVectorKeyframeTrack";
import {AniNumberKeyframeTrack} from "@/js/util/AniNumberKeyframeTrack";
import {AniInterpolant} from "@/js/util/AniInterpolant";

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

        if (this.init) {
            this._loadFromInit(this.init.animations);

            if (this.init.autoStart) {
                this.play();
            }
        }
    }

    stop() {
        this.pause();

        this.rootElement.removeEventListener("contextmenu", this.onContextMenu);
    }

    play() {
        if (this.actions.camera) {
            this.actions.camera.reset();
            this.actions.camera.play();
        }
    }

    pause() {
        if (this.actions.camera) {
            this.actions.camera.halt();
        }
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        if (this.mixers.camera) {
            this.mixers.camera.update(delta);
        }
    }

    reset(animationParams) {
        const parsedParams = new URLSearchParams(animationParams ?? "");

        if (parsedParams.get("mode") === "rotate") {
            // localhost:5173/#overworld:0:0:0:1500:0:0:0:0:animation/mode=rotate&autostart=true&duration=100000&posX=-140&posY=60&posZ=-338&angle=60&distance=60

            const autoStart = parsedParams.get("autostart") === "true";
            const duration = parseInt(parsedParams.get("duration"));
            const posX = parseFloat(parsedParams.get("posX"));
            const posY = parseFloat(parsedParams.get("posY"));
            const posZ = parseFloat(parsedParams.get("posZ"));
            const angle = parseFloat(parsedParams.get("angle")) * (Math.PI / 180);
            const distance = parseFloat(parsedParams.get("distance"));

            this.init = this._initFromObjectRotateMode(duration, {x: posX, y: posY,z: posZ}, angle, distance, autoStart);
        }
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

    _loadFromInit(animations) {
        if (this.mixers?.camera) {
            // For some reason this causes low-res
            this.mixers.camera.stopAllAction();
        }

        const cameraTracks = [];
        let durationOffset = 0;
        // merge multiple tracks for the same property tracks into a single track

        for (const scene of animations.scenes) {
            for (const track of scene.tracks) {
                const interpolant = (tr, result) => new AniInterpolant(
                    track.keyframes.map(kf => kf.interpolation),
                    tr.times,
                    tr.values,
                    tr.getValueSize(),
                    result
                );

                if (track.type === "vector") {
                    const keyframeTrack = new AniVectorKeyframeTrack(
                        track.property,
                        track.keyframes.map(kf => kf.time + durationOffset),
                        track.keyframes.flatMap(kf => [kf.value.x, kf.value.y, kf.value.z]),
                        interpolant,
                    );

                    cameraTracks.push(keyframeTrack);
                } else if (track.type === "number") {
                    const keyframeTrack = new AniNumberKeyframeTrack(
                        track.property,
                        track.keyframes.map(kf => kf.time + durationOffset),
                        track.keyframes.map(kf => kf.value),
                        interpolant,
                    )

                    cameraTracks.push(keyframeTrack);
                }
            }

            durationOffset += scene.duration;
        }

        const durationTotal = durationOffset;

        const clips = {
            camera: new AnimationClip('Action-Camera', durationTotal, cameraTracks),
        };

        this.mixers = {
            camera: new AnimationMixer(this.manager),
        }

        this.actions = {
            camera: (() => {
                const action = this.mixers.camera.clipAction(clips.camera);
                action.setLoop(LoopRepeat);
                action.startAt(0);                // delay in seconds
                action.clampWhenFinished = true;

                return action;
            })()
        };
    }

    _initFromObjectRotateMode(duration, position, angle, distance, autoStart) {
        const animations = {
            scenes: [
                {
                    duration: duration,
                    tracks: [
                        {
                            target: 'camera',
                            property: '.backdropOpacity',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: 0
                                },
                            ]
                        },

                        {
                            target: 'camera',
                            property: '.position',
                            type: 'vector',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: position
                                },
                            ]
                        },

                        {
                            target: 'camera',
                            property: '.angle',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: angle
                                },
                            ]
                        },

                        {
                            target: 'camera',
                            property: '.rotation',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: 0
                                },
                                {
                                    time: duration,
                                    interpolation: 'linear',
                                    value: Math.PI * 2
                                },
                            ]
                        },

                        {
                            target: 'camera',
                            property: '.ortho',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: 0
                                },
                            ]
                        },

                        {
                            target: 'camera',
                            property: '.distance',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: distance
                                },
                            ]
                        },
                    ]
                },
            ],
        };

        return {
            animations: animations,
            autoStart: autoStart
        }
    }
}
