<template>
<div class="main">
  <div id="custom-view"></div>
</div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { onMounted } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let scene: THREE.Scene
let camera: THREE.Camera
let renderer: THREE.WebGLRenderer
let orbitControls: OrbitControls

// 创建场景
const addScene = () => {
  scene = new THREE.Scene()
  const axes = new THREE.AxesHelper(500)
  scene.add(axes)

  const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 )
  const material = new THREE.MeshNormalMaterial()

  const mesh = new THREE.Mesh( geometry, material )
  scene.add( mesh )
}

// 创建相机
const addCamera = () => {
  camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 5000)
  camera.position.set(0, 500, 0)
  camera.lookAt(scene.position)
  scene.add(camera)
}

// 创建渲染
const addRenderer = () => {
  const canvas = document.querySelector('#custom-view')
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setClearAlpha(0.2)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled  = true //激活阴影
  renderer.render(scene, camera)
  canvas?.appendChild(renderer.domElement)
}

// 创建控制器
const addControl = () => {
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.target.set(0, 0, 0)
  orbitControls.autoRotate = false
  orbitControls.enableDamping = true
  orbitControls.enableZoom = true
  orbitControls.enablePan = true
}


const animate = () => {

  requestAnimationFrame( animate );

  // required if controls.enableDamping or controls.autoRotate are set to true
  orbitControls.update();

  renderer.render( scene, camera );

}

const initAnimate = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(initAnimate)
}

// 正方
const addBox = (config: BoxConfig, position: Position) => {
  const geometry = new THREE.BoxGeometry(config.width, config.height, config.depth)
  const material = new THREE.MeshBasicMaterial({ color: config.color, wireframe: true })
  const object = new THREE.Mesh( geometry, material )
  object.name = config.name
  object.position.set(position.x, position.y, position.z)
  scene.add(object)
}

// 球
const addSphere = (config: SphereConfig, position: Position) => {
  const geometry = new THREE.SphereGeometry(config.radius, config.widthSegments, config.heightSegments)
  const material = new THREE.MeshBasicMaterial({ color: config.color })
  const object = new THREE.Mesh( geometry, material )
  object.position.set(position.x, position.y, position.z)
  scene.add(object)
}

// 圆柱
const addCylinder = (config: CylinderConfig, position: Position) => {
  const geometry = new THREE.CylinderGeometry(config.radiusTop, config.radiusBottom, config.height, config.radialSegments)
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color( config.color ) })
  const object = new THREE.Mesh( geometry, material )
  object.position.set(position.x, position.y, position.z)
  scene.add(object)
}

onMounted(() => {
  addScene()
  addCamera()
  addRenderer()
  addControl()
  initAnimate()
  animate()

  addBox({ width: 20, height: 10, depth: 20, color: '#dfdfdf', name: 'box1' }, { x: 0, y: 0, z: 0 })
  addBox({ width: 20, height: 10, depth: 20, color: '#dfdfdf', name: 'box1' }, { x: 100, y: 0, z: 0 })
  addBox({ width: 20, height: 10, depth: 20, color: '#dfdfdf', name: 'box1' }, { x: -100, y: 0, z: 0 })
})
</script>

<style lang="scss">
.main {
  width: 100%;
  height: 100vh;
}
</style>