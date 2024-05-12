const originalCanvas = document.getElementById('original')
const originalCtx = originalCanvas.getContext('2d')
const deformedCanvas = document.getElementById('deformed')
const deformedCtx = deformedCanvas.getContext('2d')

const img = new Image()

img.onload = function () {
  const width = img.width
  const height = img.height

  originalCanvas.width = width
  originalCanvas.height = height
  deformedCanvas.width = width
  deformedCanvas.height = height

  // Draw on original canvas.
  originalCtx.drawImage(img, 0, 0, width, height)

  const imageData = originalCtx.getImageData(0, 0, width, height)
  const pixelData = imageData.data  // [r, g, b, a, r, g, b, a, ...]

  // Control points and deformed control points.
  const rows = 6
  const cols = 6

  const tick = () => {
    const deformedPoints = []
    const controlPoints = []

    for (let j = 0; j < rows; j++) {
      controlPoints[j] = []
      deformedPoints[j] = []
      for (let i = 0; i < cols; i++) {
        const x = (i / (cols - 1)) * width
        const y = (j / (rows - 1)) * height
        controlPoints[j][i] = { x, y }

        const dx = Math.round(Math.random() * 8 * (Math.random() < 0.5 ? -1 : 1))
        const dy = Math.round(Math.random() * 8 * (Math.random() < 0.5 ? -1 : 1))
        deformedPoints[j][i] = { x: x + dx, y: y + dy }
      }
    }

    // Draw control points on original canvas.
    originalCtx.clearRect(0, 0, width, height)
    originalCtx.drawImage(img, 0, 0, width, height)
    originalCtx.font = '16px Arial'
    originalCtx.fillStyle = '#ff0000'
    controlPoints.forEach((row, y) => {
      row.forEach((point, x) => {
        const index = (y * cols + x)
        originalCtx.fillText(index, point.x, point.y)
      })
    })

    const deformedData = applyFFD(pixelData, width, height, controlPoints, deformedPoints)
    const newImageData = new ImageData(deformedData, width, height)

    deformedCtx.clearRect(0, 0, width, height)
    deformedCtx.putImageData(newImageData, 0, 0)

    // Draw deformed control points on deformed canvas.
    deformedCtx.font = '16px Arial'
    deformedCtx.fillStyle = '#ff0000'
    deformedPoints.forEach((row, y) => {
      row.forEach((point, x) => {
        // deformedCtx.beginPath()
        // deformedCtx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        // deformedCtx.fill()
        const index = (y * cols + x)
        deformedCtx.fillText(index, point.x, point.y)
      })
    })

    setTimeout(tick, 1000 / 30)
  }

  tick()
}

img.src = 'test.png'

function applyFFD (pixelData, width, height, controlPoints, deformedPoints) {
  const deformedData = new Uint8ClampedArray(pixelData.length)

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // 计算当前点的变形位置
      const [u, v] = getUV(x, y, width, height)
      const [newX, newY] = deformPoint(u, v, controlPoints, deformedPoints)

      // 获取变形后点的颜色值
      const color = getColor(pixelData, width, height, newX, newY)

      // 将颜色值赋给变形后的数据
      const index = (y * width + x) * 4
      deformedData[index] = color[0]
      deformedData[index + 1] = color[1]
      deformedData[index + 2] = color[2]
      deformedData[index + 3] = color[3]
    }
  }

  return deformedData
}

function deformPoint (u, v, controlPoints, deformedPoints) {
  const rows = controlPoints.length
  const cols = controlPoints[0].length

  // 计算网格中的位置
  const i = Math.floor(u * (cols - 1))
  const j = Math.floor(v * (rows - 1))

  // 计算在小网格内的局部 u, v
  const localU = (u * (cols - 1)) - i
  const localV = (v * (rows - 1)) - j

  // 获取控制点
  const P00 = controlPoints[j][i], P01 = controlPoints[j + 1][i]
  const P10 = controlPoints[j][i + 1], P11 = controlPoints[j + 1][i + 1]
  const Q00 = deformedPoints[j][i], Q01 = deformedPoints[j + 1][i]
  const Q10 = deformedPoints[j][i + 1], Q11 = deformedPoints[j + 1][i + 1]

  // 双线性插值计算新的点位置
  const x = (1 - localU) * (1 - localV) * Q00.x +
    localU * (1 - localV) * Q10.x +
    (1 - localU) * localV * Q01.x +
    localU * localV * Q11.x

  const y = (1 - localU) * (1 - localV) * Q00.y +
    localU * (1 - localV) * Q10.y +
    (1 - localU) * localV * Q01.y +
    localU * localV * Q11.y

  return [x, y]
}

function getUV (x, y, width, height) {
  return [x / width, y / height]  // 这里的 UV 就是直接平铺映射.
}

function clamp (value, min, max) {
  return Math.max(min, Math.min(value, max))
}

function getColor (pixelArray, width, height, x, y) {
  const i = clamp(Math.round(x), 0, width - 1)
  const j = clamp(Math.round(y), 0, height - 1)
  const index = (j * width + i) * 4
  return [
    pixelArray[index],
    pixelArray[index + 1],
    pixelArray[index + 2],
    pixelArray[index + 3]
  ]
}
