const stageCanvas = document.getElementById('app-canvas')
const stageContext = stageCanvas.getContext('2d')

const rangeF = document.getElementById('range-f')
const rangeD = document.getElementById('range-d')
const rangeRotation = document.getElementById('range-rotation')
const rangeFText = document.getElementById('range-f-text')
const rangeDText = document.getElementById('range-d-text')
const rangeRotationText = document.getElementById('range-rotation-text')

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
  const f = parseFloat(rangeF.value)
  const d = parseFloat(rangeD.value)

  // 投影矩阵.
  const projectionMatrix = [
    [f, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 1 / d, 1]
  ]

  // 我们可以在这里加入一个沿着 Y 轴旋转的要素，来模拟摄影机移动.
  const angle = parseFloat(rangeRotation.value) * Math.PI / 180  // 摄影机移动角度.

  // Y 轴的旋转矩阵.
  const rotationMatrix = [
    [window.math.cos(angle), 0, window.math.sin(angle), 0],
    [0, 1, 0, 0],
    [-window.math.sin(angle), 0, window.math.cos(angle), 0],
    [0, 0, 0, 1]
  ]

  // 将顶点扩展为齐次坐标.
  const w = 1
  const homogeneousVertices = CUBE_VERTICES.map(vertex => [...vertex, w])
  console.log('Homogeneous:', homogeneousVertices)

  // 应用旋转矩阵.
  // 如果不旋转，则可以不创建 rotatedVertices，直接在下面使用 homogeneousVertices 即可.
  const rotatedVertices = homogeneousVertices.map(vertex => window.math.multiply(rotationMatrix, vertex))
  console.log('Rotated:', rotatedVertices)

  // 应用透视投影矩阵.
  const projectedVertices = rotatedVertices.map(vertex => window.math.multiply(projectionMatrix, vertex))
  console.log('Projected:', projectedVertices)

  // 进行齐次坐标转换.
  const normalizedVertices = projectedVertices.map(vertex => {
    const w = vertex[3]
    return vertex.map(coord => coord / w)
  })
  console.log('Normalized:', normalizedVertices)

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

rangeF.addEventListener('input', () => {
  const newValue = parseFloat(rangeF.value)
  rangeFText.textContent = newValue
  drawGraphics()
})

rangeD.addEventListener('input', () => {
  const newValue = parseFloat(rangeD.value)
  rangeDText.textContent = newValue
  drawGraphics()
})

rangeRotation.addEventListener('input', () => {
  const newValue = parseFloat(rangeRotation.value)
  rangeRotationText.textContent = newValue
  drawGraphics()
})

drawGraphics()
