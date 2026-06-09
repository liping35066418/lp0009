export interface ModelInfo {
  id: string;
  name: string;
  category: ModelCategory;
  dimensions: { width: number; depth: number; height: number };
  description?: string;
  color?: string;
}

export type ModelCategory =
  | 'ground'
  | 'flower-stand'
  | 'plant'
  | 'water'
  | 'ornament';

export interface PlacedModel {
  id: string;
  modelId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SpaceConfig {
  width: number;
  depth: number;
}

export const CATEGORY_NAMES: Record<ModelCategory, string> = {
  ground: '庭院地面',
  'flower-stand': '花架',
  plant: '绿植花卉',
  water: '小型水景',
  ornament: '户外摆件'
};

export const CATEGORY_ICONS: Record<ModelCategory, string> = {
  ground: '🟫',
  'flower-stand': '🪜',
  plant: '🌿',
  water: '💧',
  ornament: '🪴'
};
