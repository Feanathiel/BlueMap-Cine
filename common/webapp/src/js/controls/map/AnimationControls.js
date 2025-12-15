import {mapMixersActions} from "@/js/util/animations/mapper";

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
        this.mixerActions = [];
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
        for (const mixerAction of this.mixerActions) {
            mixerAction.action.reset();
            mixerAction.action.play();
        }
    }

    pause() {
        for (const mixerAction of this.mixerActions) {
            mixerAction.action.halt();
        }
    }

    /**
     * @param delta {number}
     * @param map {Map}
     */
    update(delta, map) {
        for (const mixerAction of this.mixerActions) {
            mixerAction.mixer.update(delta);
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
            // localhost:5173/#world:0:0:0:0:0:0:0:0:animation/mode=cine&autoStart=true&showUi=false&data=eyJzY2VuZXMiOlt7ImR1cmF0aW9uIjoxODAwMCwidHJhY2tzIjpbeyJwcm9wZXJ0eSI6Im92ZXJsYXkub3BhY2l0eSIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxfSx7InRpbWUiOjMwMDAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MH0seyJ0aW1lIjoxNTAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjowfSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoibGluZWFyIiwidmFsdWUiOjF9XX0seyJwcm9wZXJ0eSI6ImxpZ2h0LnN1biIsImtleWZyYW1lcyI6W3sidGltZSI6MTAwMDAsImludGVycG9sYXRpb24iOiJlYXNlT3V0Q3ViaWMiLCJ2YWx1ZSI6MX0seyJ0aW1lIjoxODAwMCwiaW50ZXJwb2xhdGlvbiI6ImVhc2VPdXRDdWJpYyIsInZhbHVlIjowfV19LHsicHJvcGVydHkiOiJjYW1lcmEucG9zaXRpb24iLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJlYXNlT3V0Q3ViaWMiLCJ2YWx1ZSI6eyJ4Ijo1NS44NDA1MDA1MDU2NzUzNiwieSI6NTkuMTc4NTM2NDYzMTkyNzgsInoiOi0xNTUwLjI1MzM2NDkzOTUwNDV9fSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoiZWFzZU91dEN1YmljIiwidmFsdWUiOnsieCI6MzAuODYxNzM0NzM1MjgxNjEsInkiOjExMy4zNTUsInoiOi0xNTQ1LjI5NzEzMTUzNDQ0MzV9fV19LHsicHJvcGVydHkiOiJjYW1lcmEuYW5nbGUiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJlYXNlT3V0Q3ViaWMiLCJ2YWx1ZSI6MC44ODQwMTY0MTY2NTcxNTUyfSx7InRpbWUiOjE4MDAwLCJpbnRlcnBvbGF0aW9uIjoiZWFzZU91dEN1YmljIiwidmFsdWUiOjEuNDAzNzE1NDI1NjMwODY5NX1dfSx7InByb3BlcnR5IjoiY2FtZXJhLnJvdGF0aW9uIiwia2V5ZnJhbWVzIjpbeyJ0aW1lIjowLCJpbnRlcnBvbGF0aW9uIjoiZWFzZU91dEN1YmljIiwidmFsdWUiOjEuNTgzMzYyODM1MjQ4OTc5NX0seyJ0aW1lIjoxODAwMCwiaW50ZXJwb2xhdGlvbiI6ImVhc2VPdXRDdWJpYyIsInZhbHVlIjoxLjU3ODk0ODY0OTY4NzEyNDN9XX0seyJwcm9wZXJ0eSI6ImNhbWVyYS5kaXN0YW5jZSIsImtleWZyYW1lcyI6W3sidGltZSI6MCwiaW50ZXJwb2xhdGlvbiI6ImVhc2VPdXRDdWJpYyIsInZhbHVlIjoyMzguMTQ4MDY4NzQ2OTM0NjV9LHsidGltZSI6MTgwMDAsImludGVycG9sYXRpb24iOiJlYXNlT3V0Q3ViaWMiLCJ2YWx1ZSI6NX1dfV19LHsiZHVyYXRpb24iOjEwMDAwLCJ0cmFja3MiOlt7InByb3BlcnR5Ijoib3ZlcmxheS5vcGFjaXR5Iiwia2V5ZnJhbWVzIjpbeyJ0aW1lIjowLCJpbnRlcnBvbGF0aW9uIjoibGluZWFyIiwidmFsdWUiOjF9LHsidGltZSI6MjAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjowfSx7InRpbWUiOjgwMDAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MH0seyJ0aW1lIjoxMDAwMCwiaW50ZXJwb2xhdGlvbiI6ImxpbmVhciIsInZhbHVlIjoxfV19LHsicHJvcGVydHkiOiJjYW1lcmEucG9zaXRpb24iLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6eyJ4IjozOC4xMzI0MTU3NjkxODU4MjYsInkiOjExMi4zMzQyNTYyOTgyOTE4LCJ6IjotMTU3NS4yMjg0MDMyMTAwMjd9fSx7InRpbWUiOjEwMDAwLCJpbnRlcnBvbGF0aW9uIjoiZWFzZUluT3V0UXVhZCIsInZhbHVlIjp7IngiOjM4LjEzMjQxNTc2OTE4NTgyNiwieSI6MTEyLjMzNDI1NjI5ODI5MTgsInoiOi0xNTI1LjgyNjE2ODMwMzk1MTF9fV19LHsicHJvcGVydHkiOiJjYW1lcmEuYW5nbGUiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MS40NTUzNjM1MzIwNTk1MTQ0fV19LHsicHJvcGVydHkiOiJjYW1lcmEucm90YXRpb24iLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MS41NjczMjgxMDc2NTU0MzUzfV19LHsicHJvcGVydHkiOiJjYW1lcmEuZGlzdGFuY2UiLCJrZXlmcmFtZXMiOlt7InRpbWUiOjAsImludGVycG9sYXRpb24iOiJsaW5lYXIiLCJ2YWx1ZSI6MTUuOH1dfV19XX0=

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
        for (const mixerAction of this.mixerActions) {
            mixerAction.mixer.stopAllAction();
        }

        const config = {
            "camera.position": {target: this.manager, property: ".position", type: 'vector', default: {x: 0, y: 0, z: 0}},
            "overlay.opacity": {target: this.manager, property: ".backdropOpacity", type: 'number', default: 0},
            "camera.angle": {target: this.manager, property: ".angle", type: 'number', default: 0},
            "camera.rotation": {target: this.manager, property: ".rotation", type: 'number', default: 0},
            "camera.ortho": {target: this.manager, property: ".ortho", type: 'number', default: 0},
            "camera.distance": {target: this.manager, property: ".distance", type: 'number', default: 0},
            "light.sun": {target: this.manager.mapViewer.data.uniforms.sunlightStrength, property: ".value", type: 'number', default: 1},
            "light.ambient": {target: this.manager.mapViewer.data.uniforms.ambientLight, property: ".value", type: 'number', default: 0.1},
        };

        this.mixerActions = mapMixersActions(animations, config);
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
}
