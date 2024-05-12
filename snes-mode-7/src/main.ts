import { Stage } from './stage'
import { Texture } from './texture'

const STAGE_WIDTH = 1024
const STAGE_HEIGHT = 768
const STAGE_BACKGROUND = '#ffffff'
const FOCAL_LENGTH = 250 // Camera-to-screen distance.
const SCALE_FACTOR = 100
const PIXEL_COUNT = STAGE_WIDTH * STAGE_HEIGHT

const HALF_HEIGHT = Math.round(STAGE_HEIGHT / 2)
const HALF_PIXLE_COUNT = Math.round(PIXEL_COUNT / 2)

const floorTexture = new Texture('floor.jpg')
await floorTexture.load()

const ceilingTexture = new Texture('ceiling.jpg')
await ceilingTexture.load()

const stageCanvas = document.querySelector('#stage-canvas') as HTMLCanvasElement

const clamp = (min: number, max: number, value: number): number => {
  return Math.min(Math.max(value, min), max)
}

const stage = new Stage(stageCanvas, {
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
  background: STAGE_BACKGROUND
})

stage.onTick((_, context) => {
  const imageDataBuffer = new Uint8ClampedArray(PIXEL_COUNT * 4)

  // 创建一个一直增量的位置偏移，可以让画面看起来在动，可有可无.
  const delta = Math.round(performance.now()) / 1000
  const position = [Math.sin(delta), delta]

  for (let _y = HALF_HEIGHT; _y < STAGE_HEIGHT; _y++) {
    for (let _x = 0; _x < STAGE_WIDTH; _x++) {
      // Mode 7 的 X、Y、Z 计算方法.
      // This is where the magic is.
      const x = STAGE_WIDTH / 2 - _x
      const y = _y + FOCAL_LENGTH
      const z = _y - HALF_HEIGHT + 0.01

      // X、Y、Z 的屏幕投影.
      // const pX = x / z * SCALE_FACTOR
      // const pY = y / z * SCALE_FACTOR
      // Magic ended.

      // 这里额外加入了位置信息，可以让画面动起来.
      const pX = (x / z + position[0]) * SCALE_FACTOR
      const pY = (y / z + position[1]) * SCALE_FACTOR

      // 模拟空气透视，接近中间的像素颜色变暗.
      const attenuation = clamp(0, 1, 1.5 * (Math.abs(z) / HALF_HEIGHT))

      // 画贴图，生成新的 ImageData.
      // 绘制两部分，地板和天花板.
      const floorTextureSize = floorTexture.size
      const floorIndex = (_y * STAGE_WIDTH + _x) * 4
      const floorPosition = [
        Math.round(pX % floorTextureSize[0]),
        Math.round(pY % floorTextureSize[1])
      ]
      const floorColor = floorTexture.getPixelRGBA(floorPosition[0], floorPosition[1])
      imageDataBuffer[floorIndex] = floorColor[0]
      imageDataBuffer[floorIndex + 1] = floorColor[1]
      imageDataBuffer[floorIndex + 2] = floorColor[2]
      imageDataBuffer[floorIndex + 3] = floorColor[3] * attenuation

      // 这里为了减少计算量公用了循环，效果就是取出的天花板画面和地板一致.
      // 为了让天花板看起来向天花板，这里在填充像素的时候进行了镜像.
      const ceilingTextureSize = floorTexture.size
      const ceilingIndex = (HALF_PIXLE_COUNT - ((_y - HALF_HEIGHT) * STAGE_WIDTH - _x)) * 4 // 像素 index 进行了镜像.
      const ceilingPosition = [
        Math.round(pX % ceilingTextureSize[0]),
        Math.round(pY % ceilingTextureSize[1])
      ]
      const ceilingColor = ceilingTexture.getPixelRGBA(ceilingPosition[0], ceilingPosition[1])
      imageDataBuffer[ceilingIndex] = ceilingColor[0]
      imageDataBuffer[ceilingIndex + 1] = ceilingColor[1]
      imageDataBuffer[ceilingIndex + 2] = ceilingColor[2]
      imageDataBuffer[ceilingIndex + 3] = ceilingColor[3] * attenuation
    }
  }

  const imageData = new ImageData(imageDataBuffer, STAGE_WIDTH)
  context.putImageData(imageData, 0, 0)
})

stage.start()
