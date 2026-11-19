import * as THREE from 'three';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

/** World positions of each 3D scene. Scenes are stacked downward so the camera "glides down". */
export const POSITIONS = {
  hero: v(0, 0, 0),
  leak: v(0, -40, 0),
  water: v(0, -80, 0),
  crack: v(0, -120, 0),
  grout: v(0, -160, 0),
  epoxy: v(0, -200, 0),
  tile: v(0, -240, 0),
  outro: v(0, -280, 0),
};

// Offset from a scene origin.
const at = (scene, x, y, z) => POSITIONS[scene].clone().add(v(x, y, z));

/**
 * Camera keyframes: position + look-at target. The two CatmullRom curves pass exactly
 * through each key at u = index / (count - 1), which the director tweens between.
 */
const KEYS = [
  ['heroStart', at('hero', 0, 3.4, 7.5), at('hero', 0, -0.3, 0)],
  ['heroOut', at('hero', 2.5, -12, 13), at('hero', 0, -22, 0)],
  ['leak', at('leak', -2, 2.6, 13.5), at('leak', -0.6, 2, 0)],
  ['leakEnd', at('leak', -0.6, 2.3, 11), at('leak', -0.6, 2, 0)],
  ['toWater', at('leak', 3, -18, 13), at('leak', 0, -28, 0)],
  ['water', at('water', 9, 4.4, 11), at('water', 0, 0.4, 0)],
  ['waterEnd', at('water', 7.5, 5.8, 13), at('water', 0, 1.8, 0)],
  ['toCrack', at('crack', 3, 18, 12), at('crack', 0, 8, 0)],
  ['crack', at('crack', 0, 0.4, 9.5), at('crack', 0, 0, 0)],
  ['crackClose', at('crack', 0.9, 0.15, 3.3), at('crack', 0.6, 0, 0)],
  ['toGrout', at('grout', -5, 20, 13), at('grout', 0, 8, 0)],
  ['grout', at('grout', -1.8, 1.8, 13), at('grout', 0, 0, 0)],
  ['groutEnd', at('grout', 1.4, 2.6, 12), at('grout', 0, 0, 0)],
  ['toEpoxy', at('epoxy', 4, 14, 12), at('epoxy', 0, 4, 0)],
  ['epoxy', at('epoxy', -12, 1.4, 8), at('epoxy', -7, 0.4, -6)],
  ['epoxyEnd', at('epoxy', 9, 1.4, 8), at('epoxy', 14, 0.4, -6)],
  ['toTile', at('tile', 3, 16, 12), at('tile', 0, 6, 0)],
  ['tile', at('tile', -3.5, 7, 8), at('tile', 0.5, 0, 0)],
  ['tileEnd', at('tile', 1.5, 5.2, 6.5), at('tile', 2, 0, -0.5)],
  ['hold', at('outro', 0, 24, 18), at('outro', 0, 14, 0)],
  ['outro', at('outro', 0, 5.5, 8.5), at('outro', 0, 0, 0)],
];

export function createCameraPath({ skip = [] } = {}) {
  const keys = KEYS.filter((k) => !skip.includes(k[0]));
  const posCurve = new THREE.CatmullRomCurve3(keys.map((k) => k[1]), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(keys.map((k) => k[2]), false, 'centripetal');
  const last = keys.length - 1;
  const index = Object.fromEntries(keys.map((k, i) => [k[0], i]));

  return {
    /** Curve parameter for a named key. */
    u: (name) => index[name] / last,
    sample(t, outPos, outTgt) {
      const c = THREE.MathUtils.clamp(t, 0, 1);
      posCurve.getPoint(c, outPos);
      tgtCurve.getPoint(c, outTgt);
    },
  };
}
