<template>
  <div id="container">
    <a-scene mindar-image="imageTargetSrc: ./targets.mind;" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
      <a-assets>
        <!-- <template v-for="v in ObjsData">
          <a-asset-item
            :id="v.name + '-obj'"
            :src="`./objs/${v.fileName}.obj`"
          ></a-asset-item>
          <a-asset-item
            :id="v.name + '-mtl'"
            :src="`./objs/${v.fileName}.mtl`"
          ></a-asset-item>
        </template> -->

        <a-asset-item
            id="fj-obj"
            src="./objs/fj.obj"
          ></a-asset-item>
          <a-asset-item
            id="fj-mtl"
            src="./objs/fj.mtl"
          ></a-asset-item>
      </a-assets>
      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
      <a-entity mixin="giant" obj-model="obj: #fj-obj; mtl: #fj-mtl" position="0 0 0" scale="0.05 0.05 0.05"></a-entity>
    </a-scene>
  </div>
</template>
<script lang="ts" setup>
import 'mind-ar/dist/mindar-image.prod.js'
import 'aframe'
import 'mind-ar/dist/mindar-image-aframe.prod.js'
// import { ObjsData } from '/@/data/objs'
</script>