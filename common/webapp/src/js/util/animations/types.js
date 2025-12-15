
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

/**
 * @typedef Config
 * @property {Object} target
 * @property {string} property
 * @property {'number' | 'vector'} type
 * @property {Object | number} default
 */