<template>
<div class="main">
  <button class="button" @click="setBox">设置</button>
  <div id="custom-view"></div>
  <div class="detail-dialog" v-if="showDetails">
    <div>{{ clickMeshName }}</div>
    <button @click="showDetails = false"></button>
  </div>
</div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CustomObjsData } from '/@/data/customObjs'
import { gsap } from 'gsap'

let scene: THREE.Scene
let camera: THREE.Camera
let renderer: THREE.WebGLRenderer
let orbitControls: OrbitControls
let raycaster: THREE.Raycaster
let mouse:THREE.Vector2

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
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000)
  camera.position.set(0, 0, -200)
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

// 创建灯光
const addLights = () => {
  // 环境光
  const ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient); // 将环境光添加到场景中

  // 太阳光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.4);
  directionalLight.position.set(400, 400, 400);
  directionalLight.castShadow = false;
  scene.add(directionalLight);

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

// 鼠标点击
let clickMeshName: string
const handleMouseDown = (event: MouseEvent) => {
  let x = (event.clientX / window.innerWidth) * 2 - 1
  let y = -(event.clientY / window.innerHeight) * 2 + 1
  mouse =new THREE.Vector2(x, y)
  raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)
  console.log('当前点击的Mash', intersects)
  const dialogDom: HTMLDialogElement = document.querySelector('#info-dialog')
  if (intersects && intersects.length > 0) {
    clickMeshName = intersects[0].object.name
    console.log(intersects[0].object.name)
  }
}


const animate = () => {

  requestAnimationFrame( animate );

  // required if controls.enableDamping or controls.autoRotate are set to true
  orbitControls.update();

  renderer.render( scene, camera );

}

const initAnimate = () => {
  renderer.render(scene, camera)
  // if (camera.position.x < 300) {
  //   gsap.to(
  //     camera.position,
  //     {x: camera.position.x + 5, y: 10, z: 50 } //需要移动的距离
  //   )
  // }
  requestAnimationFrame(initAnimate)
}

// 正方
const addBox = (config: BoxConfig, position: Position) => {
  const geometry = new THREE.BoxGeometry(config.width, config.height, config.depth)
  const material = new THREE.MeshBasicMaterial({ color: config.color, wireframe: true })
  // const material = new THREE.MeshPhongMaterial({ color: config.color })
  const object = new THREE.Mesh( geometry, material )
  object.name = config.name
  object.position.set(position.x, position.y, position.z)
  scene.add(object)
}

// 放置模型
const addModel = () => {
  CustomObjsData.forEach(v => {
    addBox(v.config, v.position)
  })
}

const setStatus = (id: string) => {
  const box = scene.getObjectByName('box' + id)
  box?.traverse(child => {
    if ( child instanceof THREE.Mesh ) {
      child.material= new THREE.MeshPhongMaterial({color: 0xFF0000, transparent: true, opacity: 0.8})
    }
  })
}

const setBox = () => {
  setStatus('2-2')
  setStatus('5-4')
  setStatus('3-5')
  setStatus('4-1')
}
onMounted(() => {
  addScene()
  addCamera()
  addRenderer()
  addControl()
  addLights()
  initAnimate()
  animate()

  addModel()
  document.addEventListener('click', handleMouseDown, false)
})
</script>

<style lang="scss">
.main {
  width: 100%;
  height: 100vh;
}
.button {
  position: absolute;
  top: 20px;
  left: 20px;
}
.detail-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40px;
  background: #fff;
}
</style>