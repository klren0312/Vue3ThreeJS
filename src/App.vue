<template>
  <div class="main-page">
    <div id="webgl"></div>
    <div class="iframe"></div>
  </div>
</template>
<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import { nextTick, onMounted } from 'vue'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'
import GUI from 'lil-gui'
import TypeIt from 'typeit'
export default {
  setup() {
    let scene: THREE.Scene
    let camera: THREE.Camera
    let renderer: THREE.WebGLRenderer
    let orbitControls: OrbitControls
    let skeletonHelper: THREE.SkeletonHelper
    let vrmPeople: VRM
    let currentMixer: THREE.AnimationMixer
    const clock = new THREE.Clock()
    let isTalk: Boolean = false

    // 创建场景
    const addScene = () => {
      scene = new THREE.Scene()
      // const axes = new THREE.AxesHelper(120);
      // scene.add(axes);
    }

    // 创建相机
    const addCamera = () => {
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000)
      camera.position.set( -2, 0, 3 )
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
        if (xhr.total === xhr.loaded) {
          setTimeout(() => {
            isTalk = true
            new (TypeIt as any)('.iframe', {
              speed: 90,
              startDelay: 900,
              afterComplete: async () => {
                rigRotation("LeftUpperArm", { x: 0, y: -0, z: 1.25, rotationOrder: 'XYZ' })
                rigRotation("LeftLowerArm", { x: 0, y: -0, z: 0, rotationOrder: 'XYZ' })
                vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.A, 1)
                isTalk = false
              },
            })
              .type('杜富国、聂海胜等被授予八一勋章')
              .break()
              .type('上半年服务业发展韧性显现')
              .break()
              .type('人民网评：让假期调休更得民心')
              .break()
              .type('汽车撞人疑致31伤 肇事者已被控制')
              .break()
              .type('日本四名政客跟风窜访台湾')
              .break()
              .type('每日优鲜30分钟极速达业务关停').go()
            rigRotation("LeftUpperArm", { x: 0, y: -0, z: 0.955044166691297, rotationOrder: 'XYZ' })
            rigRotation("LeftLowerArm", { x: 0, y: -0, z: -1.05557513160617, rotationOrder: 'XYZ' })
          }, 5000)
        }
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
          model.position.set(-2, -1, 0)

          scene.add(model)
          // skeletonHelper = new THREE.SkeletonHelper(model)
          // scene.add(skeletonHelper)
          // setupDatGui()

          rigRotation("RightUpperArm", { x: 0, y: 0, z: -1.25, rotationOrder: 'XYZ' })
          rigRotation("RightLowerArm", { x: -0, y: 0, z: -0, rotationOrder: 'XYZ' })
          rigRotation("LeftUpperArm", { x: 0, y: -0, z: 1.25, rotationOrder: 'XYZ' })
          rigRotation("LeftLowerArm", { x: 0, y: -0, z: 0, rotationOrder: 'XYZ' })

          // prepareAnimation(vrm)

        })
      }, onProgress, onError)
    }

    const rigRotation = (
        name: keyof typeof VRMSchema.HumanoidBoneName,
        rotation = { x: 0, y: 0, z: 0, rotationOrder: 'XYZ' },
        dampener = 1,
        lerpAmount = 0.3
    ) => {
      const Part = vrmPeople?.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName[name])
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

    const animate = () => {
      requestAnimationFrame( animate )
      // orbitControls.update()
      const deltaTime = clock.getDelta()

      if ( vrmPeople && isTalk) {

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

    // animation
		const prepareAnimation = (vrm: VRM) => {
      currentMixer = new THREE.AnimationMixer( vrm.scene )

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

      const blinkTrack = new THREE.NumberKeyframeTrack(
        vrmPeople?.blendShapeProxy?.getBlendShapeTrackName( VRMSchema.BlendShapePresetName.Blink ) || VRMSchema.BlendShapePresetName.Blink, // name
        [ 0.0, 0.5, 1.0 ], // times
        [ 0.0, 1.0, 0.0 ] // values
      )

      const clip = new THREE.AnimationClip( 'blink', 2.0, [ armTrack, blinkTrack ] )
      const action = currentMixer.clipAction( clip )
      action.play()
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
  position: relative;
  background: #dfdfdf;
  // background: url(./assets/bg.jpg) center / 100% 100% no-repeat;

  #webgl {
    overflow: hidden;
  }

  .iframe {
    position: absolute;
    top: 50px;
    right: 20%;
    width: 50%;
    height: 50%;
    background: #fff;
  }
}
</style>
