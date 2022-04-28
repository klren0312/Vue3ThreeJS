export interface Position {
  x: number
  y: number
  z: number
}

export interface Rotation {
  x: number
  y: number
  z: number
}

export interface TextConfig {
  value: string
  fontColor: string
  bgColor: string
}


export interface ModelConfig {
  type: string
  fileName?: string
  name: string
  position: Position
  scale?: number
  rotation?: Rotation
  textConfig?: TextConfig
}

export const ObjsData: ModelConfig[] = [
  {type: 'model', fileName: 'ground', name: 'ground', position: {x: -50, y: 0, z: -15}, scale: 0.05},
  {type: 'model', fileName: 'frontGround', name: 'frontGround', position: {x: -50, y: 0, z: -15}, scale: 0.05},
  {type: 'model', fileName: 'wait1', name: 'wait1', position: {x: -50, y: 0, z: -15}, scale: 0.05},
  {type: 'model', fileName: 'wait2', name: 'wait2', position: {x: -50, y: 0, z: -15}, scale: 0.05},
  {type: 'model', fileName: 'wait3', name: 'wait3', position: {x: -50, y: 0, z: -15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge1', position: {x:-50, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge1-1', position: {x:-50, y: 0, z: -20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge2', position: {x:-56, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge2-1', position: {x:-56, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge3', position: {x:-48, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge3-1', position: {x:-48, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge4', position: {x:-52.8, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge4-1', position: {x:-52.8, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge5', position: {x:-70.5, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge5-1', position: {x:-70.5, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge6', position: {x:-65.1, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge6-1', position: {x:-65.1, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge7', position: {x:-80.5, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge7-1', position: {x:-80.5, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge8', position: {x:-82.5, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge8-1', position: {x:-82.5, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge9', position: {x:-85, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge9-1', position: {x:-85, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge10', position: {x:-88, y: 0, z:-15}, scale: 0.05},
  {type: 'model', fileName: 'bridge1', name: 'bridge10-1', position: {x:-88, y: 0, z:-20}, scale: 0.05},
  {type: 'model', fileName: 'bridge2', name: 'bridge2-1', position:{ x: -48, y: 0, z: -15}, scale: 0.05},
  {type: 'model', fileName: 'fj', name: 'plane1', position: { x: 28.5, y: 0, z: -3}, scale: 0.01,  rotation: {x: 0, y: 119.6, z: 0}},
  {type: 'model', fileName: 'fj', name: 'plane1-1', position: { x: 28.8, y: 0, z: 5}, scale: 0.01,  rotation: {x: 0, y: 185, z: 0}},
  {type: 'model', fileName: 'fj', name: 'plane2', position: { x: 24.5, y: 0, z: -3}, scale: 0.01,  rotation: {x: 0, y: 119.6, z: 0}},
  {type: 'model', fileName: 'fj', name: 'plane2-1', position: { x: 23.8, y: 0, z: 5}, scale: 0.01,  rotation: {x: 0, y: 185, z: 0}},
  {type: 'model', fileName: 'fj', name: 'plane3', position: { x: 17, y: 0, z: -3}, scale: 0.01,  rotation: {x: 0, y: 119.6, z: 0}},
  {type: 'model', fileName: 'fj', name: 'plane3-1', position: { x: 17, y: 0, z: 5}, scale: 0.01,  rotation: {x: 0, y: 185, z: 0}},
  {type: 'model', fileName: 'fj', name: 'plane4', position: { x: 9, y:0, z:-3}, scale: 0.01,  rotation: {x: 0, y: 119.6, z: 0}},
  {type: 'model', fileName: 'fj', name: 'plane4-1', position: { x: 9, y:0, z:5}, scale: 0.01,  rotation: {x: 0, y: 185, z: 0}},
  {type: 'model', fileName: 'fj', name: 'animatePlane', position: { x: 35, y: 0, z: 21.25}, scale: 0.02, rotation: {x: 0, y: 4.78, z: 0}},
  // 飞机故障提示
  {type: 'tip', name: 'planeErrorTip', textConfig: { value: '正在检修中...', bgColor: '#ff0000', fontColor: '#ffffff'}, position: { x: 28.5, y: 1.5, z: -3}},
  // 飞机延误提示
  {type: 'tip', name: 'putoffTip', textConfig: { value: '晚点 00:40', bgColor: '#ff0000', fontColor: '#ffffff'}, position: { x: 9, y: 1.5, z: -3}},
  // 登机桥故障提示
  {type: 'tip', name: 'bridgeErrorTip', textConfig: { value: '机械故障', bgColor: '#ff0000', fontColor: '#ffffff'}, position: { x: 13.8, y: 2, z: 4}}
]
