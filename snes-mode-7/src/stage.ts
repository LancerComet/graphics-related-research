interface IStageOption {
  width: number
  height: number
  background: string
}

type OnTickCallback = (stage: HTMLCanvasElement, context: CanvasRenderingContext2D) => void

class Stage {
  private readonly _stage: HTMLCanvasElement
  private readonly _context: CanvasRenderingContext2D
  private readonly _options: IStageOption

  private _startTick: boolean = false
  private readonly _tickCallbacks: OnTickCallback[] = []

  private clearStage () {
    const { width, height } = this._options
    this._context.clearRect(0, 0, width, height)
  }

  private initStage () {
    const { width, height, background } = this._options
    const stage = this._stage
    stage.width = width
    stage.height = height
    stage.style.backgroundColor = background
  }

  private tick () {
    this.clearStage()

    // Call callbacks.
    for (const callback of this._tickCallbacks) {
      callback(this._stage, this._context)
    }

    if (this._startTick) {
      requestAnimationFrame(() => {
        this.tick()
      })
    }
  }

  tickOnce () {
    this.tick()
  }

  start () {
    this._startTick = true
    this.tick()
  }

  stop () {
    this._startTick = false
  }

  onTick (callback: OnTickCallback) {
    if (!this._tickCallbacks.includes(callback)) {
      this._tickCallbacks.push(callback)
    }
  }

  constructor (stage: HTMLCanvasElement, options: IStageOption) {
    this._stage = stage
    this._context = stage.getContext('2d') as CanvasRenderingContext2D
    this._options = options
    this.initStage()
  }
}

export {
  Stage
}
