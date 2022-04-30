/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface Window {
  MINDAR: any
}

declare interface Position {
  x: number
  y: number
  z: number
}

declare interface Rotation {
  x: number
  y: number
  z: number
}

declare interface TextConfig {
  value: string
  fontColor: string
  bgColor: string
}

declare interface BoxConfig {
  width: number
  height: number
  depth: number
  color: string
  name: string
}

declare interface SphereConfig {
  radius: number
  widthSegments: number
  heightSegments: number
  color: string
  name: string
}

declare interface CylinderConfig {
  radiusTop: number
  radiusBottom: number
  height: number
  radialSegments?: number
  color: string
  name: string
}
