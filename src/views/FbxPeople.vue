<template>
  <div class="container">
  </div>
</template>
<script lang="ts" setup>
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
let scene: THREE.Scene
let camera: THREE.Camera
let renderer: THREE.WebGLRenderer
let orbitControls: OrbitControls

 // 创建场景
const addScene = () => {
  scene = new THREE.Scene()
  // const axes = new THREE.AxesHelper(120);
  // scene.add(axes);
}

// 创建相机
const addCamera = () => {
  const canvas = document.querySelector('#webgl')
  camera = new THREE.PerspectiveCamera(45, (canvas?.clientWidth || 0) / (canvas?.clientHeight || 0), 0.1, 5000)
  camera.position.set( 0, 0, 2 )
  camera.lookAt(scene.position)
  scene.add(camera)
}

// 创建渲染
const addRenderer = () => {
  const canvas = document.querySelector('#webgl')
  renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
  })
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas?.clientWidth || 0, canvas?.clientHeight || 0);
  renderer.shadowMap.enabled  = true; //激活阴影
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

</script>
<style lang="scss">
.container {
  position: relative;
}

.hidden {
  display: none;
}
</style>
