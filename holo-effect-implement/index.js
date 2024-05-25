const stageWidth = 600
const stageHeight = 600

const stageCanvas = document.getElementById('app-canvas')
const stageContext = stageCanvas.getContext('2d')

stageCanvas.width = stageWidth
stageCanvas.height = stageHeight
stageCanvas.willReadFrequently = true

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

class WaveCircle {
  getPath () {
    const path = []
    const angleIncrement = (2 * Math.PI) / this.numberOfPoints

    for (let i = 0; i < this.numberOfPoints; i++) {
      const angle = i * angleIncrement;
      const waveOffset = this.waveAmplitude * Math.sin(this.waveFrequency * angle) * this.delta
      let x = this.centerX + (this.radius + waveOffset) * Math.cos(angle)
      let y = this.centerY + (this.radius + waveOffset) * Math.sin(angle)
      path.push({ x, y })
    }

    // Rotate the path.
    const cos = Math.cos(this.rotation)
    const sin = Math.sin(this.rotation)
    for (let i = 0; i < path.length; i++) {
      const x = path[i].x - this.centerX
      const y = path[i].y - this.centerY
      path[i].x = x * cos - y * sin + this.centerX
      path[i].y = x * sin + y * cos + this.centerY
    }

    return path
  }

  getImageData () {
    const canvas = document.createElement('canvas')
    canvas.width = stageWidth
    canvas.height = stageHeight

    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    const path = this.getPath()
    context.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) {
      context.lineTo(path[i].x, path[i].y)
    }
    context.closePath()

    context.strokeStyle = this.lineColor
    context.lineWidth = this.lineWidth
    context.stroke()

    return context.getImageData(0, 0, canvas.width, canvas.height)
  }

  tick () {
    // Reverse the delta increment when the delta reaches the limit.
    const deltaIncrement = this.deltaIncrement
    if (
      this.delta > 1 && deltaIncrement > 0 ||
      this.delta < -1 && deltaIncrement < 0
    ) {
      this.deltaIncrement = -deltaIncrement
    }
    this.delta += this.deltaIncrement

    // Tick rotation.
    this.rotation += this.rotationDelta
  }

  constructor (
    centerX, centerY, radius, numberOfPoints,
    waveAmplitude, waveFrequency, deltaIncrement, rotationDelta,
    lineWidth, lineColor
  ) {
    this.centerX = centerX
    this.centerY = centerY
    this.radius = radius
    this.numberOfPoints = numberOfPoints
    this.delta = 0
    this.waveAmplitude = waveAmplitude
    this.waveFrequency = waveFrequency
    this.deltaIncrement = deltaIncrement
    this.rotation = 0
    this.rotationDelta = rotationDelta
    this.lineWidth = lineWidth
    this.lineColor = lineColor
  }
}

const waves = [
  new WaveCircle(280, 280, 150, 100, 20, 2, 0.005, -0.01, 50, 'rgb(40, 0, 0)'),
  new WaveCircle(280, 280, 150, 100, 20, 3, 0.005, 0.01, 50, 'rgb(40, 0, 0)'),
  new WaveCircle(280, 280, 150, 100, 10, 2, 0.005, 0.005, 30, 'rgb(50, 0, 0)'),
  new WaveCircle(280, 280, 150, 100, 10, 6, 0.0025, -0.003, 10, 'rgb(50, 0, 0)'),
  new WaveCircle(280, 280, 150, 100, 10, 3, 0.001, 0.0003, 5, 'rgb(60, 0, 0)'),
  new WaveCircle(280, 280, 150, 100, 14, 2, 0.015, -0.001, 3, '#f67441'),
  new WaveCircle(280, 280, 145, 1010, 14, 3, 0.01, 0.05, 2, '#f67441'),
  new WaveCircle(280, 280, 140, 1010, 14, 5, 0.0001, 0.001, 1, '#f67441'),
]

const processor = (stageColor, overlayColor) => {
  return Math.min(stageColor + overlayColor, 255)  // Color dodge.
}

const tick = () => {
  stageContext.clearRect(0, 0, stageCanvas.width, stageCanvas.height)

  const waveImageDatas = []

  for (const wave of waves) {
    wave.tick()
    const waveImageData = wave.getImageData()
    waveImageDatas.push(waveImageData)
  }

  const imageData = new ImageData(stageWidth, stageHeight)
  for (let i = 0; i < imageData.data.length; i += 4) {
    let r = 0
    let g = 0
    let b = 0

    for (let j = 0; j < waveImageDatas.length; j++) {
      const waveImageData = waveImageDatas[j]
      const _r = waveImageData.data[i]
      const _g = waveImageData.data[i + 1]
      const _b = waveImageData.data[i + 2]
      const _a = waveImageData.data[i + 3]

      if (j === 0) {
        r = _r
        g = _g
        b = _b
      } else {
        r = processor(r, _r)
        g = processor(g, _g)
        b = processor(b, _b)
      }
    }

    imageData.data[i] = clamp(r, 0, 255)
    imageData.data[i + 1] = clamp(g, 0, 255)
    imageData.data[i + 2] = clamp(b, 0, 255)
    imageData.data[i + 3] = 255
  }

  stageContext.putImageData(imageData, 0, 0)

  requestAnimationFrame(tick)
}

tick()
