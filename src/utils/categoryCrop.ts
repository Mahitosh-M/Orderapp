export function squareCrop(width: number, height: number, zoom: number, x: number, y: number) {
  if (![width, height, zoom, x, y].every(Number.isFinite) || width <= 0 || height <= 0) throw new Error('Invalid image dimensions.')
  const side = Math.min(width, height) / Math.max(1, Math.min(3, zoom))
  return { sx: (width - side) * Math.max(0, Math.min(100, x)) / 100,
    sy: (height - side) * Math.max(0, Math.min(100, y)) / 100, side }
}
