<template>
  <div id="webgl"></div>
</template>
<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import { onMounted } from 'vue'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'
import GUI from 'lil-gui'

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

    // 创建场景
    const addScene = () => {
      scene = new THREE.Scene()
      // const axes = new THREE.AxesHelper(120);
      // scene.add(axes);
    }

    // 创建相机
    const addCamera = () => {
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000)
      // camera.position.set(0, 20, 20)
      camera.position.set( 0.0, 1.0, 5.0 )
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
      // animateVRM()
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
          model.position.set(0, 0, 0)
          // model.scale.set(6, 6, 6)
          scene.add(model)
          // skeletonHelper = new THREE.SkeletonHelper(model)
          // scene.add(skeletonHelper)
          // setupDatGui()
          prepareAnimation(vrm)
        })
      }, onProgress, onError)
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

    const faceAnimate = () => {
      requestAnimationFrame( faceAnimate );

				const deltaTime = clock.getDelta();

				if ( vrmPeople ) {

					// tweak blendshape
					const s = Math.sin( Math.PI * clock.elapsedTime );
					vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.A, 0.5 + 0.5 * s );
					// vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.BlinkL, 0.5 - 0.5 * s );

					// update vrm
					vrmPeople.update( deltaTime );

				}

        if (currentMixer) {
          currentMixer.update(deltaTime)
        }

				renderer.render( scene, camera );
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

      const clip = new THREE.AnimationClip( 'blink', 1.0, [ armTrack, blinkTrack ] )
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
      faceAnimate()
    }

    onMounted(() => {
      init()
      animate()
    })
  }
}
</script>