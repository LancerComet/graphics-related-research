const stageCanvas = document.getElementById('app-canvas')
const stageContext = stageCanvas.getContext('2d')

const rangeFov = document.getElementById('range-fov')
const rangeRotation = document.getElementById('range-rotation')
const fovText = document.getElementById('fov-text')
const rotationText = document.getElementById('rotation-text')

const { sin, cos, tan, multiply } = window.math

const CUBE_VERTICES = [
  [-1, -1, -1],
  [ 1, -1, -1],
  [ 1,  1, -1],
  [-1,  1, -1],
  [-1, -1,  1],
  [ 1, -1,  1],
  [ 1,  1,  1],
  [-1,  1,  1]
]

const CUBE_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7]
]

// 绘制缩放参数.
const scale = 100
const offsetX = stageCanvas.width / 2
const offsetY = stageCanvas.height / 2

const drawLine = (startPoint, endPoint) => {
  const [startX, startY] = startPoint
  const [endX, endY] = endPoint
  stageContext.beginPath()
  stageContext.moveTo(startX * scale + offsetX, startY * scale + offsetY)
  stageContext.lineTo(endX * scale + offsetX, endY * scale + offsetY)
  stageContext.stroke()
}

const drawGraphics = () => {
  const fov = parseFloat(rangeFov.value) * Math.PI / 180
  const aspect = stageCanvas.width / stageCanvas.height
  const near = 0.1
  const top = near * tan(fov / 2)
  const right = top * aspect

  // 投影矩阵.
  const projectionMatrix = [
    [near / right, 0, 0, 0],
    [0, near / top, 0, 0],
    [0, 0, 1, 0],  // 忽略 z 坐标对 w 的影响，避免深度插值，因为 Canvas 不处理.
    [0, 0, -near, 1]  // 这里的 -near 用于将所有顶点向摄像机方向移动，保证 z 坐标始终为正.
  ];

  // 我们可以在这里加入一个沿着 Y 轴旋转的要素，来模拟摄影机移动.
  const angle = parseFloat(rangeRotation.value) * Math.PI / 180  // 摄影机移动角度.

  // Y 轴的旋转矩阵.
  const rotationMatrix = [
    [Math.cos(angle), 0, Math.sin(angle), 0],
    [0, 1, 0, 0],
    [-Math.sin(angle), 0, Math.cos(angle), 0],
    [0, 0, 0, 1]
  ]

  // 将顶点扩展为齐次坐标.
  const homogeneousVertices = CUBE_VERTICES.map(vertex => [...vertex, 1])
  console.log('Homogeneous:', homogeneousVertices)

  // 应用旋转矩阵.
  // 如果不旋转，则可以不创建 rotatedVertices，直接在下面使用 homogeneousVertices 即可.
  const rotatedVertices = homogeneousVertices.map(vertex => multiply(rotationMatrix, vertex))
  console.log('Rotated:', rotatedVertices)

  // 应用透视投影矩阵.
  const projectedVertices = rotatedVertices.map(vertex => multiply(projectionMatrix, vertex))
  console.log('Projected:', projectedVertices)

  // 进行齐次坐标转换.
  const normalizedVertices = projectedVertices.map(vertex => {
    const w = vertex[3] // 获取透视除法后的w值，应与z值相同
    return [vertex[0] / w, vertex[1] / w] // 只需x, y坐标进行透视除法
  })
  console.log('Normalized:', normalizedVertices);

  // 获取二维坐标.
  const projected2D = normalizedVertices.map(vertex => [vertex[0], vertex[1]])
  console.log('Projected 2D:', projected2D)

  stageContext.strokeStyle = '#ffffff'
  stageContext.fillStyle = '#ffffff'
  stageContext.font = '14px Arial'

  stageContext.clearRect(0, 0, stageCanvas.width, stageCanvas.height)

  // 在坐标点旁边写一个序号.
  projected2D.forEach(([x, y], index) => {
    stageContext.fillText(index.toString(), x * scale + offsetX, y * scale + offsetY)
  })

  // 绘制.
  CUBE_EDGES.forEach(([start, end]) => {
    drawLine(projected2D[start], projected2D[end])
  })
}

rangeFov.addEventListener('input', () => {
  const newValue = parseFloat(rangeFov.value)
  fovText.textContent = newValue
  drawGraphics()
})

rangeRotation.addEventListener('input', () => {
  const newValue = parseFloat(rangeRotation.value)
  rotationText.textContent = newValue
  drawGraphics()
})

drawGraphics()
