<template>
  <div id="webgl"></div>
</template>
<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three'
import { onMounted, Ref } from 'vue'

export default {
  setup() {
    let scene: THREE.Scene
    let camera: THREE.Camera
    let renderer: THREE.WebGLRenderer
    let orbitControls: OrbitControls

    // 创建场景
    const addScene = () => {
      scene = new THREE.Scene()
      const axes = new THREE.AxesHelper(120);
      scene.add(axes);

      const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
      const material = new THREE.MeshNormalMaterial();

      const mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh )
    }

    // 创建相机
    const addCamera = () => {
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000)
      camera.position.set(100, 100, 100)
      camera.lookAt(scene.position)
      scene.add(camera)
    }

    // 创建渲染
    const addRenderer = () => {
      const canvas = document.querySelector('#webgl')
      renderer = new THREE.WebGLRenderer({
        antialias: true
      })
      renderer.setClearColor(0xffffff)
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
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

    function animate() {

      requestAnimationFrame( animate );

      // required if controls.enableDamping or controls.autoRotate are set to true
      orbitControls.update();

      renderer.render( scene, camera );

    }

    // 创建灯光
    const addLights = () => {
      // 环境光
      const ambient = new THREE.AmbientLight(0xffffff);
      scene.add(ambient); // 将环境光添加到场景中

      // 户外光照效果
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
      hemiLight.position.set(0, 200, 0);
      scene.add(hemiLight);

      // 太阳光
      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(0, 100, 0);
      directionalLight.castShadow = false;
      scene.add(directionalLight);
    }

    // 加载过程处理
    const onLoadProgess = (xhr: ProgressEvent<EventTarget>) => {
      console.log(xhr)
    }
    // 加载失败处理
    const onLoadError = (event: ErrorEvent) => {}
    const mtlLoader = new MTLLoader()
    mtlLoader.setPath('/objs/')

    // 添加模型
    const addModel = (fileName: string, instanceName: string, x: number, y: number, z: number, scale: number = 0.01, instance?: THREE.Group | null | undefined) => {
      mtlLoader.load(fileName + '.mtl', (materials) => {
				materials.preload()
				var objLoader = new OBJLoader()
				objLoader.setMaterials(materials)
				objLoader.setPath('objs/')
				objLoader.load(fileName + '.obj', (object) => {
					object.position.x = x
					object.rotation.y = y
          object.position.z = z
					object.scale.set(scale, scale, scale)
					object.name = instanceName
          if (instance) {
            instance = object
          }
					scene.add(object)
				}, onLoadProgess, onLoadError);
			})
    }
    let animatePlane: THREE.Group
    let bridgeHasColor: THREE.Group
    const initModel = () => {
      // 地面
      addModel('ground', 'ground', -50, 0, -15, 0.05)
      // 最前端广场
      addModel('frontGround', 'frontGround', -50, 0, -15, 0.05)
      // 候机1
      addModel('wait1', 'wait1', -50, 0, -15, 0.05)
      // 候机2
      addModel('wait2', 'wait2', -50, 0, -15, 0.05)
      // 候机3
      addModel('wait3', 'wait3', -50, 0, -15, 0.05)
      // 登机桥
      var bridgeArr = [
				{x:-50, z:-15, y: 0},
				{x:-56, z:-15, y: 0},
				{x:-48, z:-15, y: 0},
				{x:-52.8, z:-15, y: 0},
				{x:-70.5, z:-15, y: 0},
				{x:-65.1, z:-15, y: 0},
				{x:-80.5, z:-15, y: 0},
				{x:-82.5, z:-15, y: 0},
				{x:-85, z:-15, y: 0},
				{x:-88, z:-15, y: 0},
				{x:-65.1, z:-1, y: 0}
			]
      bridgeArr.forEach((point, i) => {
        addModel('bridge1', 'bridge' + i + 1, point.x, point.y, point.z, 0.05)
      })
      // 登机桥带拐
      addModel('bridge2', 'bridge2-1', -50, 0, -15, 0.05)
      // 飞机
      addModel('fj', 'plane1', 28.5, 119.6, -3, 0.01)
      addModel('fj', 'plane2', 24.5, 119.6, -3, 0.01)
      addModel('fj', 'plane3', 17, 119.6, -3, 0.01)
      addModel('fj', 'plane4', 9, 119.6, -3, 0.01)
      addModel('fj', 'animatePlane', 35, 4.695, 21.25, 0.02, animatePlane)
    }

    const init = () => {
      addScene()
      addCamera()
      addRenderer()
      addControl()
      addLights()
      initModel()
    }

    onMounted(() => {
      init()
      animate()
    })
  }
}
</script>