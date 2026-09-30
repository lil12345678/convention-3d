import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

export class ScreenMaskPass extends ShaderPass {
  constructor() {
    super({
      name: 'ScreenMaskShader',

      uniforms: {
        tDiffuse: { value: null },
        opacity: { value: 1.0 },
        intensity: { value: 1.0 },
        maskColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, // 黑色
        // maskColor: { value: new THREE.Color(0.0, 0.1, 0.3) }, // 深蓝色
        R: { value: 0.3 }, // 中心清晰区域的半径
        sr: { value: 1.0 }, // 渐变范围
      },

      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform float opacity;
        uniform float intensity;
        uniform sampler2D tDiffuse;
        uniform vec3 maskColor;
        uniform float R;
        uniform float sr;
        varying vec2 vUv;
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          float dist = sqrt((vUv.x-0.5)*(vUv.x-0.5)+(vUv.y-0.5)*(vUv.y-0.5));
          
          // 修改渐变计算方式
          float mask = smoothstep(R, R + 0.3, dist);
          
          // 在中心保持原始颜色，向外渐变为深蓝色
          // vec3 finalColor = mix(texel.rgb, texel.rgb * maskColor, mask * intensity);
           // 使用lerp进行颜色插值，保持原始颜色到黑色的渐变
          vec3 finalColor = texel.rgb * (1.0 - mask * intensity);
          gl_FragColor = vec4(finalColor, texel.a);
        }
      `,
    })
  }
}
