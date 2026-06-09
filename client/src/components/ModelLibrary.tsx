import React, { useState } from 'react';
import { ModelCategory, CATEGORY_NAMES, CATEGORY_ICONS, ModelInfo } from '../types';
import { MODEL_LIBRARY, getModelsByCategory } from '../data/modelLibrary';

interface ModelLibraryProps {
  onAddModel: (modelId: string) => void;
}

export const ModelLibrary: React.FC<ModelLibraryProps> = ({ onAddModel }) => {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('plant');
  const categories: ModelCategory[] = ['ground', 'flower-stand', 'plant', 'water', 'ornament'];

  return (
    <div className="model-library">
      <h3>🎨 素材库</h3>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            title={CATEGORY_NAMES[cat]}
          >
            <span className="cat-icon">{CATEGORY_ICONS[cat]}</span>
            <span className="cat-name">{CATEGORY_NAMES[cat]}</span>
          </button>
        ))}
      </div>

      <div className="model-grid">
        {getModelsByCategory(activeCategory).map(model => (
          <ModelCard key={model.id} model={model} onAdd={() => onAddModel(model.id)} />
        ))}
      </div>

      <div className="library-footer">
        共 {MODEL_LIBRARY.length} 款素材
      </div>
    </div>
  );
};

interface ModelCardProps {
  model: ModelInfo;
  onAdd: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onAdd }) => {
  return (
    <div className="model-card" onClick={onAdd} title="点击添加到场景">
      <div
        className="model-preview"
        style={{
          background: `linear-gradient(135deg, ${model.color}40, ${model.color}80)`,
          borderColor: model.color
        }}
      >
        <span className="model-preview-icon">
          {model.category === 'ground' && '🟩'}
          {model.category === 'flower-stand' && '🗄️'}
          {model.category === 'plant' && '🌱'}
          {model.category === 'water' && '💧'}
          {model.category === 'ornament' && '🏡'}
        </span>
      </div>
      <div className="model-info">
        <div className="model-name">{model.name}</div>
        <div className="model-dims">
          {model.dimensions.width}×{model.dimensions.depth}×{model.dimensions.height}m
        </div>
      </div>
      <button className="add-btn">+ 添加</button>
    </div>
  );
};
