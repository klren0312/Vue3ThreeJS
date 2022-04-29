<template>
  <div class="main">
    <div id="webgl"></div>
    <button class="bad-btn" @click="badTheBridge">登机桥损坏</button>
  </div>
</template>
<script lang="ts">
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three'
import { onMounted } from 'vue'
import { ObjsData } from '/@/data/objs'

export default {
  setup() {
    let scene: THREE.Scene
    let camera: THREE.Camera
    let renderer: THREE.WebGLRenderer
    let labelRenderer: CSS2DRenderer
    let orbitControls: OrbitControls
    // 创建场景
    const addScene = () => {
      scene = new THREE.Scene()
      const axes = new THREE.AxesHelper(120)
      scene.add(axes)

      const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 )
      const material = new THREE.MeshNormalMaterial()

      const mesh = new THREE.Mesh( geometry, material )
      scene.add( mesh )
    }

    // 创建相机
    const addCamera = () => {
      camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 5000)
      camera.position.set(100, 100, 100)
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
      renderer.setClearAlpha(0.2)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.shadowMap.enabled  = true //激活阴影
      renderer.render(scene, camera)
      canvas?.appendChild(renderer.domElement)
    }

    // 2D渲染器构建
		const add2DRenderer = () => {
			labelRenderer = new CSS2DRenderer()
			labelRenderer.setSize(window.innerWidth, window.innerHeight)
			labelRenderer.domElement.style.position = 'absolute'
			labelRenderer.domElement.style.top = '0'
			labelRenderer.domElement.style.pointerEvents = 'none'
			document.querySelector('#webgl')?.appendChild(labelRenderer.domElement)
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

    // 创建灯光
    const addLights = () => {
      // 环境光
      const ambient = new THREE.AmbientLight(0xffffff);
      scene.add(ambient); // 将环境光添加到场景中

      // 点光源
      const pointLight = new THREE.PointLight('#ffffff', 2.4, 0)
      pointLight.position.set(0, 200, 0)
      scene.add(pointLight)

      // 太阳光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.4);
      directionalLight.position.set(0, 50, 0);
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
    const addModel = (fileName: string, instanceName: string, position: Position, scale: number = 0.01, rotation?: Rotation) => {
      mtlLoader.load(fileName + '.mtl', (materials) => {
				materials.preload()
				var objLoader = new OBJLoader()
				objLoader.setMaterials(materials)
				objLoader.setPath('objs/')
				objLoader.load(fileName + '.obj', (object) => {
					object.position.set(position.x,  position.y, position.z)
          object.rotation.set(rotation?.x ?? 0, rotation?.y ?? 0, rotation?.z ?? 0)
					object.scale.set(scale, scale, scale)
					object.name = instanceName
					scene.add(object)
				}, onLoadProgess, onLoadError);
			})
    }

    // 添加提示
    const addTips = (name: string, textConfig: TextConfig, position: Position) => {
      const tipsGeo = new THREE.PlaneBufferGeometry(3, 1, 1, 1)
			const tips = new THREE.Mesh(tipsGeo, createFont(textConfig.value, {bgColor: textConfig.bgColor, fontColor: textConfig.fontColor}))
			tips.position.set(position.x, position.y, position.z)
      tips.name = name
			scene.add(tips)
    }

    const initModel = () => {
      const renderArr = ObjsData
      renderArr.forEach(info => {
        switch(info.type) {
          case 'model':
            addModel(<string>info.fileName, info.name, info.position, info.scale, info?.rotation)
            break
          case 'tip':
            addTips(info.name, <TextConfig>info.textConfig, info.position)
            break
          default:
            break
        }
      })

      // 动画飞机跟随的牌子
			var planeAnimateInfo = document.createElement('div')
			planeAnimateInfo.className = 'the-animate-modal'
			planeAnimateInfo.innerHTML = '<div>HU 7635</div>' +
				'<div>Boeing 787</div>'
			planeAnimateInfo.classList.add('hide')
			const planeAnimateModal = new CSS2DObject(planeAnimateInfo)
      planeAnimateModal.name = 'planeAnimateModal'
			scene.add(planeAnimateModal)
    }

		/**
     * 创建文字贴图
		 * text 文字
		 * options.fontColor 文字颜色
		 * options.bgColor 背景颜色
		 */
		const createFont = (text: string, options={bgColor: '', fontColor: ''}) => {
			const canvas = document.createElement('canvas')
			canvas.width = 512
			canvas.height = 128
			const c = canvas.getContext('2d')
			// 矩形区域填充背景
      if (c) {
        c.fillStyle = options.bgColor || '#ff0000'
        c.fillRect(0, 0, 512, 128)
        c.beginPath()
        // 文字
        c.beginPath()
        c.translate(256,64)
        c.fillStyle = options.fontColor || '#ffffff' //文本填充颜色
        c.font = 'bold 36px 微软雅黑' //字体样式设置
        c.textBaseline = 'middle' //文本与fillText定义的纵坐标
        c.textAlign = 'center' //文本居中(以fillText定义的横坐标)
        c.fillText(text, 0, 0)
      }
			const texture = new THREE.CanvasTexture(canvas)
			const textMaterial = new THREE.MeshPhongMaterial({
				map: texture, // 设置纹理贴图
				// side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.9
			})
			if (textMaterial.map) {
        textMaterial.map.needsUpdate = true
      }
			return textMaterial
		}

    		// ===================== 动画 ======================
		const initAnimate = () => {
			renderer.render(scene, camera)
			labelRenderer.render(scene, camera)
      const movePlane = scene.getObjectByName('animatePlane')
			if (movePlane) {
				movePlane.position.x -= 0.2
				if (movePlane.position.x < -10) {
					movePlane.position.y += 0.02
				}
				if (movePlane.position.x < -100) {
					movePlane.position.x = 35
					movePlane.position.y = 0
				}
        const planeAnimateModal = <CSS2DObject>scene.getObjectByName('planeAnimateModal')
        if (planeAnimateModal) {
          planeAnimateModal.position.set(movePlane.position.x, movePlane.position.y + 4.5, movePlane.position.z)
				  planeAnimateModal.element.classList.remove('hide')
        }
			}
			requestAnimationFrame(initAnimate)
		}

    const init = () => {
      addScene()
      addCamera()
      addRenderer()
      add2DRenderer()
      addControl()
      addLights()
      initModel()
      initAnimate()
    }

    const badTheBridge = () => {
      const badBridge = scene.getObjectByName('bridge2-1')
      badBridge?.traverse(child => {
        if ( child instanceof THREE.Mesh ) {
          child.material= new THREE.MeshBasicMaterial({color: 0xFF0000, transparent: true, opacity: 0.8})
        }
      })
    }

    onMounted(() => {
      init()
      animate()
    })

    return {
      badTheBridge
    }
  }
}
</script>

<style>
body,
head {
  padding: 0;
  margin: 0;
}
.main {
  background: url(../assets/ball.jpg) center / cover no-repeat;
}
.bad-btn {
  position: absolute;
  top: 20px;
  left: 20px;
}
.the-modal,
.the-animate-modal {
  padding: 5px;
  line-height: 20px;
  pointer-events: none;
  transition: visibility 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0s, left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  border-radius: 3px;
  font-size: 12px;
  color: rgb(87, 87, 87);
}
</style>
