import { useRef, useEffect } from 'react';

const vertSrc = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const fragSrc = `
precision mediump float;
varying vec2 v_uv;

uniform float u_time;
uniform vec2 u_res;
uniform float u_driftSpeed;
uniform float u_warpScale;
uniform float u_warpIntensity;
uniform vec2 u_mouse;
uniform float u_mouseActive;

#define PI 3.14159265359

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

float warpedFbm(vec2 p, float t) {
  vec2 q = vec2(fbm(p + t * 0.12), fbm(p + vec2(5.2, 1.3) + t * 0.09));
  vec2 r = vec2(
    fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.07),
    fbm(p + 3.0 * q + vec2(8.3, 2.8) + t * 0.06)
  );
  return fbm(p + 2.5 * r);
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_res.x / u_res.y, 1.0);
  float t = u_time * u_driftSpeed;
  vec2 p = (uv - 0.5) * aspect;

  vec2 mouseOffset = vec2(0.0);
  if (u_mouseActive > 0.5) {
    vec2 mPos = (u_mouse - 0.5) * aspect;
    vec2 mDelta = p - mPos;
    float mDist = length(mDelta);
    mouseOffset = -mDelta * (0.5 * exp(-mDist * mDist * 4.0));
  }

  vec2 noisePos = p * u_warpScale + mouseOffset;
  float cloud = warpedFbm(noisePos, t) * u_warpIntensity;

  float fineNoise = vnoise(noisePos * 2.5 + t * 0.15) * 0.15;
  cloud = cloud + fineNoise - 0.075;

  vec3 c0 = vec3(0.961, 0.902, 0.784);
  vec3 c1 = vec3(0.910, 0.788, 0.478);
  vec3 c2 = vec3(0.831, 0.639, 0.294);
  vec3 c3 = vec3(0.788, 0.588, 0.227);

  vec3 color = c0;
  if (cloud < 0.30) {
    color = mix(c0, c1, cloud / 0.30);
  } else if (cloud < 0.55) {
    color = mix(c1, c2, (cloud - 0.30) / 0.25);
  } else {
    color = mix(c2, c3, clamp((cloud - 0.55) / 0.25, 0.0, 1.0));
  }

  color += vnoise(p * 3.0 + t * 0.05) * 0.015 - 0.0075;

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function NoiseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uDriftSpeed = gl.getUniformLocation(prog, 'u_driftSpeed');
    const uWarpScale = gl.getUniformLocation(prog, 'u_warpScale');
    const uWarpIntensity = gl.getUniformLocation(prog, 'u_warpIntensity');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uMouseActive = gl.getUniformLocation(prog, 'u_mouseActive');

    gl.uniform1f(uDriftSpeed, 0.15);
    gl.uniform1f(uWarpScale, 2.8);
    gl.uniform1f(uWarpIntensity, 0.85);

    let mouseX = 0.5;
    let mouseY = 0.5;
    let mouseActive = 0;
    let running = true;
    let onScreen = true;
    let frameId = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas!.clientWidth * dpr);
      const h = Math.round(canvas!.clientHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
        gl!.uniform2f(uRes, w, h);
      }
    }

    function render(now: number) {
      if (!running) return;
      resize();
      gl!.uniform1f(uTime, now * 0.001);
      gl!.uniform2f(uMouse, mouseX, mouseY);
      gl!.uniform1f(uMouseActive, mouseActive);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (onScreen) frameId = requestAnimationFrame(render);
    }

    function onMove(e: MouseEvent) {
      mouseActive = 1;
      mouseX = e.clientX / window.innerWidth;
      mouseY = 1.0 - e.clientY / window.innerHeight;
    }

    // Pause the render loop when the hero is scrolled out of view to save GPU/battery.
    const io = new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !onScreen) {
        onScreen = true;
        frameId = requestAnimationFrame(render);
      } else if (!visible) {
        onScreen = false;
      }
    }, { threshold: 0 });
    io.observe(canvas);

    window.addEventListener('mousemove', onMove);

    frameId = requestAnimationFrame(render);

    return () => {
      running = false;
      onScreen = false;
      cancelAnimationFrame(frameId);
      io.disconnect();
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
