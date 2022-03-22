<template>
  <div id="webgl"></div>
</template>
<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three'
import { onMounted } from 'vue'

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

    const addObjModel = () => {
      const onProgress = (xhr: ProgressEvent<EventTarget>) => {
        console.log(xhr)
      }
      const onError = (event: ErrorEvent) => {}
      const mtlLoader = new MTLLoader()
      mtlLoader.setPath(location.pathname + '/objs/')
      mtlLoader.load('fj.mtl', materials => {
        materials.preload()
        const objLoader = new OBJLoader()
        objLoader.setMaterials(materials)
        objLoader.setPath(location.pathname + '/objs/')
        objLoader.load('fj.obj', object => {
          object.position.x = 0
          object.position.z = 0
          object.position.y = 0
          object.scale.set(0.2, 0.2, 0.2)
          object.name = 'plane1'
          scene.add(object)
        }, onProgress, onError)
      })
    }

    const init = () => {
      addScene()
      addCamera()
      addRenderer()
      addControl()
      addLights()
      addObjModel()
    }

    onMounted(() => {
      init()
      animate()
    })
  }
}
</script>