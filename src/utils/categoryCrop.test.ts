import { describe, expect, it } from 'vitest'
import { squareCrop } from './categoryCrop'
import { removeEdgeWhite } from './imageBackground'
describe('Product image preparation', () => {
  it('keeps square crops inside portrait and landscape sources at every control extreme', () => {
    for (const [width,height] of [[1200,600],[600,1200]]) for (const zoom of [1,2,3]) for (const x of [0,50,100]) for(const y of [0,50,100]) {
      const crop = squareCrop(width,height,zoom,x,y)
      expect(crop.side).toBeGreaterThan(0); expect(crop.sx).toBeGreaterThanOrEqual(0); expect(crop.sy).toBeGreaterThanOrEqual(0)
      expect(crop.sx+crop.side).toBeLessThanOrEqual(width); expect(crop.sy+crop.side).toBeLessThanOrEqual(height)
    }
    expect(() => squareCrop(0,100,1,50,50)).toThrow()
  })
  it('removes edge white but preserves enclosed white package details and colored pixels', () => {
    const pixels = new Uint8ClampedArray(5*5*4).fill(255)
    for(let y=1;y<=3;y++)for(let x=1;x<=3;x++) { const i=(y*5+x)*4; pixels[i]=30;pixels[i+1]=60;pixels[i+2]=90 }
    const middle=(2*5+2)*4; pixels[middle]=255;pixels[middle+1]=255;pixels[middle+2]=255
    removeEdgeWhite(pixels,5,5)
    expect(pixels[3]).toBe(0);expect(pixels[middle+3]).toBe(255);expect(pixels[(1*5+1)*4+3]).toBe(255)
    expect(() => removeEdgeWhite(pixels,4,5)).toThrow()
  })
})
