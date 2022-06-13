<template>
  <div class="main-page">
    <div id="webgl"></div>
    <iframe class="iframe" src="https://cn.bing.com/" frameborder="0"></iframe>
  </div>
</template>
<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import { onMounted } from 'vue'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'
import GUI from 'lil-gui'

interface ActionObjectType {
  [name: string]: THREE.AnimationAction
}

export default {
  setup() {
    let scene: THREE.Scene
    let camera: THREE.Camera
    let renderer: THREE.WebGLRenderer
    let orbitControls: OrbitControls
    let skeletonHelper: THREE.SkeletonHelper
    let vrmPeople: VRM
    let currentMixer: THREE.AnimationMixer
    let actions: ActionObjectType
    const clock = new THREE.Clock()

    // 鼠标点击定位
    let raycaster = new THREE.Raycaster()
    let mouse = new THREE.Vector2()
    let objectArr: THREE.Mesh[] = [] // 存放场景中所有mesh

    // 创建场景
    const addScene = () => {
      scene = new THREE.Scene()
      const axes = new THREE.AxesHelper(120);
      scene.add(axes);
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

    // 创建灯光
    const addLights = () => {
      // 太阳光
      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(0, 100, 0);
      directionalLight.castShadow = false;
      scene.add(directionalLight);
    }

    const addObjModel = () => {
      const onProgress = (xhr: ProgressEvent<EventTarget>) => {
        if (xhr.lengthComputable) {
          var percentComplete = xhr.loaded / xhr.total * 100;
          // 每次加载完毕将mesh放进数组
          if (percentComplete === 100) {
            objectArr = []
            scene.traverse(function (s) {
              if (s && s.type === 'Scene') {
                getMesh(s.children, objectArr, '')
              }
            })
          }
        }
      }
      // 递归出所有mesh
      const getMesh = (s: THREE.Object3D<THREE.Event>[], arr: THREE.Mesh[], name: string) => {
        s.forEach(v => {
          if (v.children && v.children.length > 0) {
            getMesh(v.children, arr, v.name)
          } else {
            if (v instanceof THREE.Mesh) {
              if (name) {
                v.name = name
              }
              arr.push(v)
            }
          }
        })
      }
      const onError = (event: ErrorEvent) => {}
      const gltfLoader = new GLTFLoader()

      gltfLoader.setPath('/objs/')
      gltfLoader.load('girl.vrm', (gltf: GLTF) => {
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        VRM.from(gltf).then((vrm: VRM) => {
          vrmPeople = vrm
          const obj = vrm?.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Hips)
          if (obj !== undefined && obj !== null) {
             obj.rotation.y = Math.PI;
          }
          vrm?.springBoneManager?.reset()
          const model = vrmPeople.scene
          model.position.set(0, -1, 0)

          scene.add(model)

          // skeletonHelper = new THREE.SkeletonHelper(model)
          // scene.add(skeletonHelper)
          // setupDatGui()

          rigRotation("RightUpperArm", { x: 0, y: 0, z: -1.25, rotationOrder: 'XYZ' })
          rigRotation("RightLowerArm", { x: -0, y: 0, z: -0, rotationOrder: 'XYZ' })
          rigRotation("LeftUpperArm", { x: 0, y: -0, z: 1.25, rotationOrder: 'XYZ' })
          rigRotation("LeftLowerArm", { x: 0, y: -0, z: 0, rotationOrder: 'XYZ' })

          currentMixer = new THREE.AnimationMixer( vrm.scene )
          blinkAnimate(vrm)
          armAnimate(vrm)
        })
      }, onProgress, onError)
    }

    const rigRotation = (
        name: keyof typeof VRMSchema.HumanoidBoneName,
        rotation = { x: 0, y: 0, z: 0, rotationOrder: 'XYZ' },
        dampener = 1
    ) => {
      const Part = vrmPeople?.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName[name])
            console.log(Part)
      let euler = new THREE.Euler(
        rotation.x * dampener,
        rotation.y * dampener,
        rotation.z * dampener,
        rotation.rotationOrder
      )
      let quaternion = new THREE.Quaternion().setFromEuler(euler)
      Part?.quaternion.slerp(quaternion, 1)
    }

    function setupDatGui() {
      const gui = new GUI()
      let folder = gui.addFolder("骨骼解析");

      folder.add(skeletonHelper, "visible");
      folder.controllers[0].name("展示骨架");

      const bones = skeletonHelper.bones;

      for (let i = 0; i < bones.length; i++) {
          const bone = bones[i];

          folder = gui.addFolder("骨骼" + bone.name);

          if (i == 0) {
              folder.add(
                  bone.position,
                  "x",
                  -10 + bone.position.x,
                  10 + bone.position.x
              );
              folder.add(
                  bone.position,
                  "y",
                  -10 + bone.position.y,
                  10 + bone.position.y
              );
              folder.add(
                  bone.position,
                  "z",
                  -10 + bone.position.z,
                  10 + bone.position.z
              );
          }

          folder.add(bone.rotation, "x", -Math.PI, Math.PI);
          folder.add(bone.rotation, "y", -Math.PI, Math.PI);
          folder.add(bone.rotation, "z", -Math.PI, Math.PI);


          if (i == 0) {
              folder.controllers[0].name("position.x");
              folder.controllers[1].name("position.y");
              folder.controllers[2].name("position.z");
              folder.controllers[3].name("rotation.x");
              folder.controllers[4].name("rotation.y");
              folder.controllers[5].name("rotation.z");
          } else {
              folder.controllers[0].name("rotation.x");
              folder.controllers[1].name("rotation.y");
              folder.controllers[2].name("rotation.z");
          }

      }
      const guiroot = <HTMLElement>document.querySelector(".lil-gui.root");
      guiroot.style.left = "calc(61.8vw + 19.1vw - 122px)";
      guiroot.style.zIndex = "10000";
    }

    // animation
        const blinkAnimate = (vrm: VRM) => {
      const blinkTrack = new THREE.NumberKeyframeTrack(
        vrmPeople?.blendShapeProxy?.getBlendShapeTrackName( VRMSchema.BlendShapePresetName.Blink ) || VRMSchema.BlendShapePresetName.Blink, // name
        [ 0.0, 0.5, 1.0 ], // times
        [ 0.0, 1.0, 0.0 ] // values
      )

      const clip = new THREE.AnimationClip('blink', 2.0, [ blinkTrack])
      actions['blink'] = currentMixer.clipAction( clip )
      // action.play()
    }

    const armAnimate = (vrm: VRM) => {
      const quatA = new THREE.Quaternion( 0.0, 0.0, 0.0, 1.0 )
      const quatB = new THREE.Quaternion( 0.0, 0.0, 0.0, 1.0 )
      quatB.setFromEuler( new THREE.Euler( 0.0, 0.0, 0.25 * Math.PI ) )
      const arm = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftUpperArm)
      let boneName = ''
      if (arm !== undefined && arm !== null) {
        boneName = arm.name + '.quaternion'
      }
      const armTrack = new THREE.QuaternionKeyframeTrack(
        boneName, // name
        [ 0.0, 0.5, 1.0 ], // times
        [ ...quatA.toArray(), ...quatB.toArray(), ...quatA.toArray() ] // values
      )
      const clip = new THREE.AnimationClip('arm', 2.0, [ armTrack ])
      actions['arm'] = currentMixer.clipAction( clip )
    }


    const animate = () => {
      requestAnimationFrame( animate )
      // orbitControls.update()
      const deltaTime = clock.getDelta()

      if ( vrmPeople ) {
        // tweak blendshape
        const s = Math.sin( 3 * Math.PI * clock.elapsedTime )
        vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.A, s)
        // vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.BlinkL, 0.5 - 0.5 * s )

        // update vrm
        vrmPeople.update( deltaTime )

      }

      if (currentMixer) {
        currentMixer.update(deltaTime)
      }

      renderer.render( scene, camera )
    }

    function handleMouseDown(event: { clientX: number; clientY: number }) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(objectArr)
      // console.log('当前点击的Mash', intersects)
      if (intersects && intersects.length > 0) {
          
      }
    }

    const init = () => {
      addScene()
      addCamera()
      addRenderer()
      addControl()
      addLights()
      addObjModel()
      animate()
    }

    onMounted(() => {
      init()
    })
  }
}
</script>
<style lang="scss">
body,
html {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
.main-page {
  height: 100vh;
  width: 100vw;
  position: relative;
  // background: url(./assets/bg.jpg) center / 100% 100% no-repeat;

  #webgl {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 200px;
    height: 400px;
    overflow: hidden;
  }

  .iframe {
    width: 100%;
    height: 100%;
    // position: absolute;
    // top: 50px;
    // right: 20%;
    // width: 50%;
    // height: 50%;
  }
}
</style>
