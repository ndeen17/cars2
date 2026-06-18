export const CARS = [
  { id: 'lumen',  name: 'Lumen GT',  body: 'Coupe',     type: 'Electric', tags: ['Electric', 'Sport'],  price: '$89,000',  transmission: 'Automatic',     seats: 4, bags: 2, rating: '4.9' },
  { id: 'atlas',  name: 'Atlas',     body: 'SUV',       type: 'Electric', tags: ['Electric', 'SUV'],    price: '$64,000',  transmission: 'Automatic',     seats: 7, bags: 4, rating: '4.8' },
  { id: 'vesper', name: 'Vesper',    body: 'Sedan',     type: 'Hybrid',   tags: ['Hybrid', 'Sedan'],    price: '$42,000',  transmission: 'Automatic',     seats: 5, bags: 3, rating: '4.7' },
  { id: 'nova',   name: 'Nova',      body: 'Coupe',     type: 'Electric', tags: ['Electric', 'Sport'],  price: '$58,000',  transmission: 'Automatic',     seats: 4, bags: 2, rating: '4.8' },
  { id: 'terra',  name: 'Terra X',   body: 'SUV',       type: 'Hybrid',   tags: ['Hybrid', 'SUV'],      price: '$51,000',  transmission: 'Auto / Manual', seats: 5, bags: 3, rating: '4.6' },
  { id: 'ion',    name: 'Ion',       body: 'Hatchback', type: 'Electric', tags: ['Electric'],           price: '$34,000',  transmission: 'Automatic',     seats: 5, bags: 1, rating: '4.5' },
  { id: 'marque', name: 'Marque S',  body: 'Sedan',     type: 'Electric', tags: ['Electric', 'Sedan'],  price: '$112,000', transmission: 'Automatic',     seats: 5, bags: 3, rating: '4.9' },
  { id: 'drift',  name: 'Drift R',   body: 'Coupe',     type: 'Petrol',   tags: ['Sport'],              price: '$76,000',  transmission: 'Manual',        seats: 2, bags: 1, rating: '4.7' },
]

export const FILTERS = ['All', 'Electric', 'SUV', 'Sedan', 'Sport', 'Hybrid']

export const FEATURED = {
  id: 'marque',
  name: 'Marque S',
  type: 'Electric',
  desc: 'The flagship grand tourer. Tri-motor all-wheel drive, a 405-mile range, and a cabin engineered around silence and speed in equal measure.',
  specs: [
    { k: 'Range',     v: '405 mi' },
    { k: 'Top Speed', v: '168 mph' },
    { k: '0–60 mph',  v: '2.9 s' },
    { k: 'Power',     v: '670 hp' },
  ],
}
