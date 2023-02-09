class Texture {
  private readonly _imageUrl: string
  private _canvas?: HTMLCanvasElement
  private _context?: CanvasRenderingContext2D
  private _imageData?: ImageData

  getPixelRGBA (x: number, y: number): number[] {
    const result = [0, 0, 0, 0]
    const width = this._canvas?.width ?? 0
    const baseIndex = (y * width + x) * 4
    if (this._imageData != null) {
      result[0] = this._imageData.data[baseIndex]
      result[1] = this._imageData.data[baseIndex + 1]
      result[2] = this._imageData.data[baseIndex + 2]
      result[3] = this._imageData.data[baseIndex + 3]
    }
    return result
  }

  get size (): number[] {
    return [this._imageData?.width ?? 0, this._imageData?.height ?? 0]
  }

  async load () {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        resolve(image)
      }
      image.onerror = () => {
        reject(new Error('IMAGE_LOAD_ERROR'))
      }
      image.src = this._imageUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    context.drawImage(image, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    this._canvas = canvas
    this._context = context
    this._imageData = imageData
  }

  constructor (imageUrl: string) {
    this._imageUrl = imageUrl
  }
}

export {
  Texture
}
