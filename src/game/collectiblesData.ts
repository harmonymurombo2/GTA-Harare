export interface CollectibleInfo {
  id: number;
  name: string;
  shonaName: string;
  lore: string;
  position: [number, number, number];
  color: string;
  emissive: string;
  landmarkNear: string;
}

export const COLLECTIBLES: CollectibleInfo[] = [
  {
    id: 1,
    name: 'The Great Zimbabwe Bird',
    shonaName: 'Hungwe',
    lore: 'Carved soapstone bird emblem representing the ancient Kingdom of Zimbabwe and the enduring soul of the nation.',
    position: [0, 1.3, 5],
    color: '#d4af37',
    emissive: '#ffbe3b',
    landmarkNear: 'Central Civic Plaza'
  },
  {
    id: 2,
    name: 'Flame Lily Bloom',
    shonaName: 'Kajongwe',
    lore: 'Gloriosa superba, the flame-red national flower of Zimbabwe, embodying vitality and natural resilience.',
    position: [-42, 1.3, 36],
    color: '#ef4444',
    emissive: '#f97316',
    landmarkNear: 'Samora Machel Jacaranda Promenade'
  },
  {
    id: 3,
    name: 'Shona Serpentine Sculpture',
    shonaName: 'Chivezwa cheMatombo',
    lore: 'Smoothly polished dark springstone artwork created in the world-renowned Zimbabwean stone sculpting tradition.',
    position: [46, 1.3, -40],
    color: '#10b981',
    emissive: '#34d399',
    landmarkNear: 'Joina Saucer Tower Forecourt'
  },
  {
    id: 4,
    name: 'Jacaranda Blossom Crystal',
    shonaName: 'Ruva reJacaranda',
    lore: 'Luminescent violet crystal celebrating Harare as "The Sunshine City", draped in lilac blossoms every spring.',
    position: [-46, 1.3, -45],
    color: '#a855f7',
    emissive: '#c084fc',
    landmarkNear: 'Heritage Colonial Clocktower Lane'
  },
  {
    id: 5,
    name: 'Mosi-oa-Tunya Sunstone',
    shonaName: 'Zuva reChiedza',
    lore: 'Radiant Highveld amber gem capturing the blazing golden hour sunshine that illuminates Harare\'s modern towers.',
    position: [38, 1.3, 42],
    color: '#f59e0b',
    emissive: '#fbbf24',
    landmarkNear: 'Charter House Globe Promenade'
  }
];
