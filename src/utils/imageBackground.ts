// Remove only near-white pixels connected to an image edge; enclosed white text is preserved.
export function removeEdgeWhite(data: Uint8ClampedArray, width: number, height: number, threshold = 238) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || data.length !== width * height * 4) throw new Error('Invalid image data.')
  const seen = new Uint8Array(width * height), queue = new Uint32Array(width * height)
  let head = 0, tail = 0
  const add = (p: number) => {
    if (seen[p]) return
    seen[p] = 1
    const i = p * 4
    if (data[i + 3] === 0 || (data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold)) queue[tail++] = p
  }
  for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x) }
  for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1) }
  while (head < tail) {
    const p = queue[head++]
    data[p * 4 + 3] = 0
    if (p % width) add(p - 1)
    if (p % width < width - 1) add(p + 1)
    if (p >= width) add(p - width)
    if (p < width * (height - 1)) add(p + width)
  }
}
