<template>
  <div class="container">
    <video class="video hidden" id="video"></video>
    <canvas class="canvas hidden" id="canvas"></canvas>
    <people-page :faceData="objectData"></people-page>
  </div>
</template>
<script>
import * as Kalidokit from 'kalidokit'
import Holistic  from '@mediapipe/holistic'
import {Camera} from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import PeoplePage from './components/People.vue'
export default {
  components: {
    PeoplePage
  },
  data() {
    return {
      objectData: {}
    }
  },
  mounted() {
    const videoElement = document.getElementById('video')
    const guideCanvas = document.getElementById('canvas')
    let holistic = new Holistic.Holistic(
      {
        locateFile: (file) => {
          if (typeof require != "undefined") {
            return __dirname + `/../node_modules/@mediapipe/holistic/${file}`
          } else {
            return `../node_modules/@mediapipe/holistic/${file}`
          }
        }
      }
    )
    holistic.onResults((results) => {
      drawResults(results)
      // do something with prediction results
      // landmark names may change depending on TFJS/Mediapipe model version
      let facelm = results.faceLandmarks
      let poselm = results.poseLandmarks
      let poselm3D = results.ea
      // let rightHandlm = results.rightHandLandmarks
      // let leftHandlm = results.leftHandLandmarks

      let faceRig = Kalidokit.Face.solve(facelm,{runtime:'mediapipe',video:videoElement})
      let poseRig = Kalidokit.Pose.solve(poselm3D,poselm,{runtime:'mediapipe',video:videoElement})

      this.objectData = structuredClone(faceRig)
    })
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await holistic.send({image: videoElement})
      },
      width: 100,
      height: 100
    })
    camera.start()

    const drawResults = (results) => {
      guideCanvas.width = videoElement.videoWidth
      guideCanvas.height = videoElement.videoHeight
      let canvasCtx = guideCanvas.getContext('2d')
      canvasCtx.save()
      canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height)
      // Use `Mediapipe` drawing functions
      drawConnectors(canvasCtx, results.poseLandmarks, Holistic.POSE_CONNECTIONS, {
        color: '#00cff7',
        lineWidth: 4,
      })
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: '#ff0364',
        lineWidth: 2,
      })
      drawConnectors(canvasCtx, results.faceLandmarks, Holistic.FACEMESH_TESSELATION, {
        color: '#C0C0C070',
        lineWidth: 1,
      })
      if (results.faceLandmarks && results.faceLandmarks.length === 478) {
        //draw pupils
        drawLandmarks(
          canvasCtx,
          [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
          {
            color: '#ffe603',
            lineWidth: 2,
          }
        )
      }
      // drawConnectors(canvasCtx, results.leftHandLandmarks, Holistic.HAND_CONNECTIONS, {
      //   color: "#eb1064",
      //   lineWidth: 5,
      // })
      // drawLandmarks(canvasCtx, results.leftHandLandmarks, {
      //   color: "#00cff7",
      //   lineWidth: 2,
      // })
      // drawConnectors(canvasCtx, results.rightHandLandmarks, Holistic.HAND_CONNECTIONS, {
      //   color: "#22c3e3",
      //   lineWidth: 5,
      // })
      // drawLandmarks(canvasCtx, results.rightHandLandmarks, {
      //   color: "#ff0364",
      //   lineWidth: 2,
      // })
    }
  }
}
</script>
<style lang="scss">
.container {
  position: relative;
}
.video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
}
.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
}
.hidden {
  display: none;
}
</style>
