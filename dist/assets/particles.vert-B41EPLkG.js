const r=`// Generic drifting/dripping particles.\r
// uMode 0: dust drifting around a centre. uMode 1: drips falling from a start point.\r
attribute vec3 aStart;\r
attribute vec4 aSeed;\r
\r
uniform float uTime;\r
uniform float uMode;\r
uniform float uIntensity;\r
uniform float uSize;\r
uniform float uPixelRatio;\r
uniform float uFall;\r
\r
varying float vAlpha;\r
varying float vBead;\r
\r
void main() {\r
  vec3 p;\r
  float a;\r
  if (uMode < 0.5) {\r
    float t = uTime * (0.05 + aSeed.w * 0.08) + aSeed.z * 6.2831;\r
    p = aStart + vec3(sin(t) * 0.35, sin(t * 0.7 + aSeed.x * 5.0) * 0.25 + fract(uTime * 0.03 + aSeed.y) * 0.6, cos(t * 0.8) * 0.2);\r
    a = 0.55 * (0.4 + 0.6 * sin(t * 2.0) * sin(t * 2.0));\r
  } else {\r
    float T = fract(uTime * (0.35 + aSeed.w * 0.3) + aSeed.z);\r
    float creep = smoothstep(0.0, 0.45, T);\r
    float fall = max(T - 0.45, 0.0) / 0.55;\r
    p = aStart + vec3(0.0, -creep * 0.25 - fall * fall * uFall, 0.0);\r
    a = smoothstep(0.0, 0.1, T) * (1.0 - smoothstep(0.85, 1.0, T));\r
  }\r
  vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
  gl_Position = projectionMatrix * mv;\r
  gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed.w * 0.8) * (10.0 / -mv.z);\r
  vAlpha = a * uIntensity;\r
  vBead = uMode;\r
}\r
`;export{r as p};
