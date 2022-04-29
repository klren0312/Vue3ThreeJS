declare global {
  interface Window {
      MINDAR: any
  }

  interface Position {
    x: number
    y: number
    z: number
  }
  
  interface Rotation {
    x: number
    y: number
    z: number
  }
  
  interface TextConfig {
    value: string
    fontColor: string
    bgColor: string
  }
  
  
  interface ModelConfig {
    type: string
    fileName?: string
    name: string
    position: Position
    scale?: number
    rotation?: Rotation
    textConfig?: TextConfig
  }

  interface BoxConfig {
    width: number
    height: number
    depth: number
    color: string
    name: string
  }

  interface SphereConfig {
    radius: number
    widthSegments: number
    heightSegments: number
    color: string
    name: string
  }

  interface CylinderConfig {
    radiusTop: number
    radiusBottom: number
    height: number
    radialSegments?: number
    color: string
    name: string
  }
}

export {}