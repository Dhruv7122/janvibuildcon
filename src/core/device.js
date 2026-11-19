/**
 * Device capability detection → quality tier used by every 3D module.
 * Override for testing with ?tier=low | ?tier=high, and ?fx=0 to disable post-processing.
 */
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function detectDevice() {
  const params = new URLSearchParams(location.search);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const small = Math.min(innerWidth, innerHeight) < 600 || innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const webgl = params.get('webgl') !== '0' && hasWebGL();

  let tier = cores <= 4 || memory <= 4 || small ? 'low' : 'high';
  if (params.get('tier') === 'low' || params.get('tier') === 'high') tier = params.get('tier');

  const low = tier === 'low';
  return {
    webgl,
    reducedMotion,
    touch,
    small,
    tier,
    pixelRatio: Math.min(window.devicePixelRatio || 1, low ? 1.25 : 2),
    postfx: !low && params.get('fx') !== '0',
    // Scale factor applied to particle/instance counts.
    particleScale: low ? 0.4 : 1,
    // Fragment-noise octaves for procedural concrete.
    octaves: low ? 3 : 5,
  };
}
