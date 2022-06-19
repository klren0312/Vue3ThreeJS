<template>
  <div class="main-page">
    <div id="webgl"></div>
    <!-- <iframe class="iframe" src="https://cn.bing.com/" frameborder="0"></iframe> -->
  </div>
</template>
<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import { onMounted, watch } from 'vue'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'
import GUI from 'lil-gui'
import * as Kalidokit from 'kalidokit'

interface FaceObj {
  head: any
  eye: { l: number; r: number }
  mouth: { 
    shape: { I: number; A: number; E: number; O: number; U: number }
  }
  pupil: { y: any; x: any }
}


export default {
  name: 'PeoplePage',
  props: {
    faceData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props: any) {
    let scene: THREE.Scene
    let camera: THREE.Camera
    let renderer: THREE.WebGLRenderer
    let orbitControls: OrbitControls
    let skeletonHelper: THREE.SkeletonHelper
    let vrmPeople: VRM
    let currentMixer: THREE.AnimationMixer
    let actions: THREE.AnimationAction[] = []
    const clock = new THREE.Clock()

    // const socket = new WebSocket('ws://localhost:28888')
    // socket.onopen = () => {
    //   console.log('Connection established')
    // }

    // socket.onerror = (e: Event) => {
    //   console.log('Error: ' + e)
    // }

    // socket.onmessage = (e: MessageEvent<any>) => {
    //   const data = JSON.parse(e.data)
    //   if (vrmPeople) {
    //     let s = 0
    //     const deltaTime = clock.getDelta()
    //     if (data.value !== 0) {
    //       s = Math.sin( 4 * Math.PI * clock.elapsedTime )
    //     }
    //     vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.A,  s )
    //     vrmPeople.update( deltaTime )
    //   }
    // }

    // 鼠标点击定位
    let raycaster = new THREE.Raycaster()
    let mouse = new THREE.Vector2()
    let objectArr: THREE.Mesh[] = [] // 存放场景中所有mesh

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
        //
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
          // blinkAnimate(vrm)
          // armAnimate(vrm)


          // 递归出所有mesh
          const getMesh = (s: THREE.Object3D<THREE.Event>[], name: string) => {
            s.forEach(v => {
              if (v.children && v.children.length > 0) {
                getMesh(v.children, v.name)
              } else {
                if (v instanceof THREE.Mesh) {
                  if (name) {
                    v.name = name
                  }
                  objectArr.push(v)
                }
              }
            })
          }
          
          model.traverse(s => {
            getMesh(s.children, '')
          })
        })
      }, onProgress, onError)
    }


    /**
     * 调试窗口
     */
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

    /**
     * 眨眼动画
     */
    const blinkAnimate = (vrm: VRM) => {
      const blinkTrack = new THREE.NumberKeyframeTrack(
        vrmPeople?.blendShapeProxy?.getBlendShapeTrackName( VRMSchema.BlendShapePresetName.Blink ) || VRMSchema.BlendShapePresetName.Blink, // name
        [ 0.0, 0.5, 1.0 ], // times
        [ 0.0, 1.0, 0.0 ] // values
      )

      const clip = new THREE.AnimationClip('blink', 2.0, [ blinkTrack])
      actions.push(currentMixer.clipAction( clip ))
    }

    /**
     * 右手臂动画
     */
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
      actions.push(currentMixer.clipAction( clip ))
    }


    const animate = () => {
      requestAnimationFrame( animate )
      // orbitControls.update()
      const deltaTime = clock.getDelta()

      if ( vrmPeople ) {
        // tweak blendshape
        // const s = Math.sin( 3 * Math.PI * clock.elapsedTime )
        // vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.A, s)
        // vrmPeople?.blendShapeProxy?.setValue( VRMSchema.BlendShapePresetName.BlinkL, 0.5 - 0.5 * s )
        if (JSON.stringify(props.faceData) !== '{}') {
          console.log(props.faceData)
          rigRotation("Neck", props.faceData.head, 0.7);
          rigFace(<FaceObj>props.faceData)
          rigRotation
        }
        // update vrm
        vrmPeople.update( deltaTime )

      }

      if (currentMixer) {
        currentMixer.update(deltaTime)
      }

      renderer.render( scene, camera )
    }

    let currentActionIndex: number | null = null
    const handleMouseDown = (event: PointerEvent) => {
      const canvas = document.querySelector('#webgl')
      mouse.x = (event.clientX / (canvas?.clientWidth || 0)) * 2 - 1
      mouse.y = -(event.clientY / (canvas?.clientHeight || 0)) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(objectArr, true)
      console.log('当前点击的Mash', intersects)
      if (intersects && intersects.length > 0) {
        const random = Math.floor(Math.random() * actions.length)
        if (currentActionIndex !== null) {
          actions[currentActionIndex].stop() 
        }
        currentActionIndex = random
        actions[random].play()
      }
    }

    // import Helper Functions from Kalidokit
    // const remap = Kalidokit.Utils.remap
    const clamp = Kalidokit.Utils.clamp
    const lerp = Kalidokit.Vector.lerp

        /**
     * 骨骼变动
     */
    const rigRotation = (
        name: keyof typeof VRMSchema.HumanoidBoneName,
        rotation = { x: 0, y: 0, z: 0, rotationOrder: 'XYZ' },
        dampener = 1
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

    let oldLookTarget = new THREE.Euler();
    const rigFace = (riggedFace: FaceObj) => {
        if (!vrmPeople) {
            return; // face motion only support VRM Now
        }

        // Blendshapes and Preset Name Schema
        const Blendshape = vrmPeople.blendShapeProxy;
        const PresetName = VRMSchema.BlendShapePresetName;

        // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
        // for VRM, 1 is closed, 0 is open.
        riggedFace.eye.l = lerp(
            clamp(1 - (riggedFace.eye.l || 0) , 0, 1),
            Blendshape?.getValue(PresetName.Blink) || 0,
            0.4
        );
        riggedFace.eye.r = lerp(
            clamp(1 - (riggedFace.eye.r || 0), 0, 1),
            Blendshape?.getValue(PresetName.Blink) || 0,
            0.4
        );
        riggedFace.eye.l = Kalidokit.Face.stabilizeBlink(
            {l:riggedFace.eye.l,r:riggedFace.eye.l},
            riggedFace.head.y
        ).l;
        riggedFace.eye.r = Kalidokit.Face.stabilizeBlink(
            {l:riggedFace.eye.r,r:riggedFace.eye.r},
            riggedFace.head.y
        ).r;
        riggedFace.eye.l /= 0.8;
        riggedFace.eye.r /= 0.8;
        Blendshape?.setValue(PresetName.BlinkL, riggedFace.eye.l);
        Blendshape?.setValue(PresetName.BlinkR, riggedFace.eye.r);

        // Interpolate and set mouth blendshapes
        Blendshape?.setValue(
            PresetName.I,
            lerp(
                riggedFace?.mouth.shape.I / 0.8,
                Blendshape.getValue(PresetName.I) || 0,
                0.3
            )
        )
        Blendshape?.setValue(
            PresetName.A,
            lerp(
                riggedFace.mouth.shape.A / 0.8,
                Blendshape.getValue(PresetName.A) || 0,
                0.3
            )
        )
        Blendshape?.setValue(
            PresetName.E,
            lerp(
                riggedFace.mouth.shape.E / 0.8,
                Blendshape.getValue(PresetName.E) || 0,
                0.3
            )
        );
        Blendshape?.setValue(
            PresetName.O,
            lerp(
                riggedFace.mouth.shape.O / 0.8,
                Blendshape.getValue(PresetName.O) || 0,
                0.3
            )
        );
        Blendshape?.setValue(
            PresetName.U,
            lerp(
                riggedFace.mouth.shape.U / 0.8,
                Blendshape.getValue(PresetName.U) || 0,
                0.3
            )
        );

        //PUPILS
        //interpolate pupil and keep a copy of the value
        let lookTarget = new THREE.Euler(
            lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
            lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
            0,
            "XYZ"
        );
        oldLookTarget.copy(lookTarget);
        vrmPeople?.lookAt?.applyer?.lookAt(lookTarget);
    };

    const init = () => {
      addScene()
      addCamera()
      addRenderer()
      addControl()
      addLights()
      addObjModel()
      animate()
      // document.querySelector('#webgl')?.addEventListener('click', handleMouseDown as EventListener, false)
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
