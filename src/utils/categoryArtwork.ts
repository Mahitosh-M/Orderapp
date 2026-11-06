const categoryArtwork: Record<string, string> = {
  'allergy & cough & cold': '/category-images/allergy-cough-cold.jpg', antibiotics: '/category-images/antibiotics-category.jpg',
  'antifungal & skin': '/category-images/antifungal-skin.jpg', 'antispectics & disinfectants': '/category-images/antiseptics-disinfectants.jpg',
  'e/e drops': '/category-images/eye-ear-drops.jpg', gastrointestinal: '/category-images/gastrointestinal.jpg',
  'health suppliments': '/category-images/health-suppliments.jpg', 'heart + bp + sugar': '/category-images/heart-bp-sugar.jpg',
  'iv fluids': '/category-images/iv-fluids.jpg', 'painkillers & fever': '/category-images/painkillers-fever.jpg',
  respules: '/category-images/respules.jpg', 'steroids / hormone': '/category-images/steroids-hormone.jpg', surgicals: '/category-images/surgicals.jpg',
}

export function getCategoryArtwork(category: string) {
  return categoryArtwork[category.trim().toLowerCase()] ?? '/category-images/antibiotics-category.jpg'
}
