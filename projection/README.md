# Projection

https://lancercomet.github.io/graphics-related-research/projection/

## 透视

投影的核心是将立体坐标点乘投影矩阵然后再获得其二维坐标.

首先要将三维坐标转为齐次坐标，选取 w 时正常情况下可使用 1，当然可以使用其他值来创造不同效果.

然后进行点乘，最后再变换回三维坐标，每个点直接除以 w 即可.

投影矩阵的定义：

```js
const fov = Math.PI / 4 // 45 degrees field of view
const aspect = stageCanvas.width / stageCanvas.height
const near = 0.1
const far = 1000
const top = near * tan(fov / 2)
const right = top * aspect

const projectionMatrix = [
  [near / right, 0, 0, 0],
  [0, near / top, 0, 0],
  [0, 0, - (far + near) / (far - near), - (2 * far * near) / (far - near)],
  [0, 0, -1, 0]
]
```

这个矩阵的构造基本上是符合 OpenGL 的深度处理的。然而，由于 Canvas 不处理 z 值，我们需要更关注如何将 x 和 y 坐标正确地映射到 Canvas。

在不使用 3D 图形库的情况下，我们通常需要简化深度 (z) 的处理，确保只通过 x 和 y 坐标进行透视变换。这样的透视矩阵可能如下：

```js
const projectionMatrix = [
  [near / right, 0, 0, 0],
  [0, near / top, 0, 0],
  [0, 0, 1, 0],  // 忽略 z 坐标对 w 的影响，避免深度插值，因为 Canvas 不处理
  [0, 0, -near, 1]  // 这里的 -near 用于将所有顶点向摄像机方向移动，保证 z 坐标始终为正
]
```

## 旋转

当顶点三维坐标变为齐次坐标后，可以加入一个旋转矩阵（或者任何期望的矩阵）来使得坐标点进行旋转，模拟摄影机移动.

代码中加入了一个沿 y 轴旋转的矩阵.
