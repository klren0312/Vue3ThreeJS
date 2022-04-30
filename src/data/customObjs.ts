interface ModelConfig {
  config: BoxConfig
  position: Position
}
export const CustomObjsData: ModelConfig[] = [
  {
    config: { width: 20, height: 10, depth: 20, color: '#dfdfdf', name: 'box1' },
    position: { x: 0, y: 0, z: 0 }
  },
  {
    config: { width: 20, height: 10, depth: 20, color: '#dfdfdf', name: 'box2' },
    position: { x: 100, y: 0, z: 0 }
  },
  {
    config: { width: 20, height: 10, depth: 20, color: '#dfdfdf', name: 'box3' },
    position: { x: -100, y: 0, z: 0 }
  }
]
