import React from 'react';
import { PlacedModel } from '../types';
import { getModelById } from '../data/modelLibrary';
import { CATEGORY_ICONS } from '../types';

interface PlacedItemsListProps {
  placedModels: PlacedModel[];
  selectedModelId: string | null;
  onSelectModel: (id: string | null) => void;
  onDelete: (id: string) => void;
}

export const PlacedItemsList: React.FC<PlacedItemsListProps> = ({
  placedModels,
  selectedModelId,
  onSelectModel,
  onDelete
}) => {
  const handleItemClick = (id: string) => {
    if (selectedModelId === id) {
      onSelectModel(null);
    } else {
      onSelectModel(id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="placed-items-list">
      <div className="list-header">
        <h3>📋 已放置物品</h3>
        <span className="list-count">{placedModels.length}</span>
      </div>

      {placedModels.length === 0 ? (
        <div className="list-empty">
          <div className="empty-icon">📦</div>
          <p>暂未放置任何物品</p>
          <p className="empty-hint">从左侧素材库点击添加</p>
        </div>
      ) : (
        <ul className="list-items">
          {placedModels.map((model, index) => {
            const modelInfo = getModelById(model.modelId);
            const isSelected = selectedModelId === model.id;
            const icon = modelInfo ? CATEGORY_ICONS[modelInfo.category] : '📦';
            const name = modelInfo?.name || model.modelId;

            return (
              <li
                key={model.id}
                className={`list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleItemClick(model.id)}
                title={`位置: X=${model.position[0].toFixed(2)}, Z=${model.position[2].toFixed(2)}`}
              >
                <span className="item-index">{index + 1}</span>
                <span className="item-icon">{icon}</span>
                <span className="item-name">{name}</span>
                <button
                  className="item-delete-btn"
                  onClick={(e) => handleDeleteClick(e, model.id)}
                  title="删除此物品"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
