import pdfjsLib from './lib/pdf.js'

export default async function render (url) {
  let _this = this
  let loadingTask = pdfjsLib.getDocument(url)

  this.$emit('on-progress')

  loadingTask.onProgress = function ({ loaded, total }) {
    _this.$emit('on-progress', loaded, total)
  }

  try {
    let pdf = await loadingTask.promise
    renderPages.call(this, pdf, 1)
  } catch (error) {
    console.error('渲染失败: ', error)
  }
}

async function renderPages (pdf, pageNum) {
  if (pageNum > pdf.numPages) return
  this.num.push({ v: pageNum, id: 'pdf-' + Math.random() })
  this.$nextTick(renderPage.bind(this, pdf, pageNum))
  renderPages.call(this, pdf, ++pageNum)
}

async function renderPage (pdf, num) {
  let page = await pdf.getPage(num)
  let canvas = document.getElementById(`page${num}`)
  let context = canvas.getContext('2d')

  let viewport = page.getViewport(1.4)

  // canvas.height = viewport.height
  // canvas.width = viewport.width

  const width = Math.floor(viewport.width)
  const height = Math.floor(viewport.height)
  const outputScale = getOutputScale(context)
  const sfx = approximateFraction(outputScale.sx)
  const sfy = approximateFraction(outputScale.sy)
  canvas.width = roundToDivide(width * outputScale.sx, sfx[0])
  canvas.height = roundToDivide(height * outputScale.sy, sfy[0])
  canvas.style.width = roundToDivide(width, sfx[1]) + 'px'
  canvas.style.height = roundToDivide(height, sfy[1]) + 'px'

  const transform = !outputScale.scaled ? null : [outputScale.sx, 0, 0, outputScale.sy, 0, 0]

  let renderContext = {
    canvasContext: context,
    viewport: viewport,
    transform,
    intent: 'print'
  }
  page.render(renderContext)
}

/* ---------- pdf缩放比例调整 ---------- */

function getOutputScale (ctx) {
  let devicePixelRatio = window.devicePixelRatio || 1
  let backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1
  let pixelRatio = devicePixelRatio / backingStoreRatio
  return {
    sx: pixelRatio,
    sy: pixelRatio,
    scaled: pixelRatio !== 1
  }
}

function approximateFraction (x) {
  if (Math.floor(x) === x) {
    return [x, 1]
  }
  let xinv = 1 / x
  let limit = 8
  if (xinv > limit) {
    return [1, limit]
  } else if (Math.floor(xinv) === xinv) {
    return [1, xinv]
  }
  let x_ = x > 1 ? xinv : x
  let a = 0
  let b = 1
  let c = 1
  let d = 1
  while (true) {
    let p = a + c
    let q = b + d
    if (q > limit) {
      break
    }
    if (x_ <= p / q) {
      c = p
      d = q
    } else {
      a = p
      b = q
    }
  }
  let result = void 0
  if (x_ - a / b < c / d - x_) {
    result = x_ === x ? [a, b] : [b, a]
  } else {
    result = x_ === x ? [c, d] : [d, c]
  }
  return result
}

function roundToDivide (x, div) {
  let r = x % div
  return r === 0 ? x : Math.round(x - r + div)
}
