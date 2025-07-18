import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// Scene setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.minDistance = 12
controls.maxDistance = 50
camera.position.set(0, 0, 20)

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 3, 5)
scene.add(directionalLight)

// Earth
const earthRadius = 10
const loader = new THREE.TextureLoader()
const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64)
const earthMaterial = new THREE.MeshPhongMaterial({
  map: loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', () => hideLoading()),
  specularMap: loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
  normalMap: loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
  normalScale: new THREE.Vector2(0.8, 0.8),
  shininess: 10,
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

// Clouds
const cloudGeometry = new THREE.SphereGeometry(earthRadius + 0.05, 64, 64)
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: loader.load('https://threejs.org/examples/textures/planets/earth_clouds_2048.jpg'),
  transparent: true,
  opacity: 0.4,
})
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial)
scene.add(clouds)

// Atmosphere
const atmosphereGeometry = new THREE.SphereGeometry(earthRadius + 0.1, 64, 64)
const atmosphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    glowColor: { value: new THREE.Color(0x00b3ff) },
    intensity: { value: 0.5 },
  },
  vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        void main() {
            float glow = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 2.0) * intensity;
            gl_FragColor = vec4(glowColor * glow, glow);
        }
    `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
})
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
scene.add(atmosphere)

// Simple GeoJSON for world landmasses
const geoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-180, 0],
              [-180, 60],
              [-120, 60],
              [-120, 0],
              [-180, 0],
            ],
            [
              [0, 0],
              [0, 60],
              [60, 60],
              [60, 0],
              [0, 0],
            ],
          ],
        ],
      },
    },
  ],
}

function createLandmasses(geoJson) {
  const landGroup = new THREE.Group()
  geoJson.features.forEach((feature) => {
    feature.geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        const shape = new THREE.Shape()
        let first = true
        ring.forEach(([lon, lat]) => {
          const phi = ((90 - lat) * Math.PI) / 180
          const theta = (lon * Math.PI) / 180
          const x = earthRadius * Math.sin(phi) * Math.cos(theta)
          const y = earthRadius * Math.cos(phi)
          const z = earthRadius * Math.sin(phi) * Math.sin(theta)
          if (first) {
            shape.moveTo(x, y)
            first = false
          } else {
            shape.lineTo(x, y)
          }
        })
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false })
        const material = new THREE.MeshPhongMaterial({ color: 0x228b22, transparent: true, opacity: 0.6 })
        const mesh = new THREE.Mesh(geometry, material)
        landGroup.add(mesh)
      })
    })
  })
  scene.add(landGroup)
}

createLandmasses(geoJson)

// Starfield with twinkling
let starCount = 5000
let starSize = 2
let twinkleSpeed = 2
let stars, starGeometry, starMaterial

function createStarfield() {
  if (stars) scene.remove(stars)
  starGeometry = new THREE.BufferGeometry()
  const starPositions = new Float32Array(starCount * 3)
  const starSizes = new Float32Array(starCount)
  const starBrightness = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 2000
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    starSizes[i] = Math.random() * starSize + 0.5
    starBrightness[i] = Math.random() * 0.5 + 0.5
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
  starGeometry.setAttribute('brightness', new THREE.BufferAttribute(starBrightness, 1))
  const starTexture = loader.load('https://threejs.org/examples/textures/sprites/disc.png')
  starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      starTexture: { value: starTexture },
      time: { value: 0 },
      twinkleSpeed: { value: twinkleSpeed },
    },
    vertexShader: `
            attribute float size;
            attribute float brightness;
            varying float vBrightness;
            void main() {
                vBrightness = brightness;
                gl_PointSize = size;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform sampler2D starTexture;
            uniform float time;
            uniform float twinkleSpeed;
            varying float vBrightness;
            void main() {
                float twinkle = sin(time * twinkleSpeed + vBrightness * 10.0) * 0.2 + 0.8;
                gl_FragColor = texture2D(starTexture, gl_PointCoord) * vec4(1.0, 1.0, 1.0, vBrightness * twinkle);
            }
        `,
    transparent: true,
  })
  stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)
}

createStarfield()

// Post-processing
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // strength
  0.4, // radius
  0.85, // threshold
)
composer.addPass(bloomPass)
const outputPass = new OutputPass()
composer.addPass(outputPass)

// Loading indicator
function hideLoading() {
  document.getElementById('loading').classList.remove('visible')
}

// Menu controls
const menuToggle = document.getElementById('menu-toggle')
const settingsMenu = document.getElementById('settings-menu')
const closeMenu = document.getElementById('close-menu')
const settingsForm = document.getElementById('settings-form')

// Update range input values display
const rangeInputs = [
  'star-size',
  'twinkle-speed',
  'glow-intensity',
  'cloud-opacity',
  'cloud-speed',
  'earth-speed',
  'bloom-strength',
  'bloom-radius',
  'bloom-threshold'
]

rangeInputs.forEach(id => {
  const input = document.getElementById(id)
  const valueSpan = document.getElementById(`${id}-value`)
  valueSpan.textContent = input.value
  input.addEventListener('input', () => {
    valueSpan.textContent = input.value
  })
})

menuToggle.addEventListener('click', () => {
  settingsMenu.classList.toggle('open')
})

closeMenu.addEventListener('click', () => {
  settingsMenu.classList.remove('open')
})

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault()
  starCount = parseInt(document.getElementById('star-count').value)
  starSize = parseFloat(document.getElementById('star-size').value)
  twinkleSpeed = parseFloat(document.getElementById('twinkle-speed').value)
  atmosphereMaterial.uniforms.intensity.value = parseFloat(document.getElementById('glow-intensity').value)
  atmosphereMaterial.uniforms.glowColor.value = new THREE.Color(document.getElementById('glow-color').value)
  cloudMaterial.opacity = parseFloat(document.getElementById('cloud-opacity').value)
  clouds.userData.rotationSpeed = parseFloat(document.getElementById('cloud-speed').value)
  earth.userData.rotationSpeed = parseFloat(document.getElementById('earth-speed').value)
  bloomPass.strength = parseFloat(document.getElementById('bloom-strength').value)
  bloomPass.radius = parseFloat(document.getElementById('bloom-radius').value)
  bloomPass.threshold = parseFloat(document.getElementById('bloom-threshold').value)
  createStarfield()
})

// Animation
let time = 0
clouds.userData.rotationSpeed = 0.0015
earth.userData.rotationSpeed = 0.001

function animate() {
  requestAnimationFrame(animate)
  time += 0.016
  earth.rotation.y += earth.userData.rotationSpeed
  clouds.rotation.y += clouds.userData.rotationSpeed
  starMaterial.uniforms.time.value = time
  controls.update()
  composer.render()
}

animate()

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})