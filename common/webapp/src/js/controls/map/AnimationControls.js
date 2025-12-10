import {AnimationClip, AnimationMixer, LoopOnce, LoopRepeat} from "three";
import {AniVectorKeyframeTrack} from "@/js/util/AniVectorKeyframeTrack";
import {AniNumberKeyframeTrack} from "@/js/util/AniNumberKeyframeTrack";
import {AniInterpolant} from "@/js/util/AniInterpolant";

const HALF_PI = Math.PI * 0.5;

export class AnimationControls {
    /**
     * @param rootElement {Element}
     */
    constructor(rootElement) {
        this.rootElement = rootElement;

        this.data = {};

        /** @type {ControlsManager} */
        this.manager = null;
    }

    /**
     * @param manager {ControlsManager}
     */
    start(manager) {
        this.manager = manager;
        this.rootElement.addEventListener("contextmenu", this.onContextMenu);

        const animations = {
            scenes: [
                {
                    duration: 12000,
                    tracks: [
                        {
                            target: 'camera',
                            property: '.backdropOpacity',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 0,
                                    interpolation: 'linear',
                                    value: 1
                                },

                                {
                                    time: 2000,
                                    interpolation: 'linear',
                                    value: 0
                                },

                                {
                                    time: 10000,
                                    interpolation: 'linear',
                                    value: 0
                                },

                                {
                                    time: 12000,
                                    interpolation: 'linear',
                                    value: 1
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
                                    value: {
                                        x: 7,
                                        y: 75,
                                        z: -338
                                    }
                                },
                                {
                                    time: 8000,
                                    interpolation: 'cubic',
                                    value: {
                                        x: 10,
                                        y: 69,
                                        z: -338
                                    }
                                },
                                {
                                    time: 10000,
                                    interpolation: 'cubic',
                                    value: {
                                        x: -5,
                                        y: 68,
                                        z: -338
                                    }
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
                                    value: 0
                                },
                                {
                                    time: 10000,
                                    interpolation: 'linear',
                                    value: Math.PI*(1/2)
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
                                    value: Math.PI/2
                                },
                                {
                                    time: 10000,
                                    interpolation: 'linear',
                                    value: 0
                                },
                            ]
                        },

                        {
                            target: 'camera',
                            property: '.ortho',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 5000,
                                    interpolation: 'linear',
                                    value: 0
                                },
                                {
                                    time: 10000,
                                    interpolation: 'linear',
                                    value: 0.35
                                },
                            ]
                        },

                        {
                            target: 'camera',
                            property: '.distance',
                            type: 'number',
                            keyframes: [
                                {
                                    time: 5000,
                                    interpolation: 'linear',
                                    value: 5
                                },
                                {
                                    time: 10000,
                                    interpolation: 'linear',
                                    value: 10
                                },
                            ]
                        },
                    ]
                },
            ],
        };

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

                if(track.type === "vector") {
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

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        this.mixers.camera.update(delta);
    }

    reset() {

    }

    onContextMenu = evt => {
        evt.preventDefault();
    }
}