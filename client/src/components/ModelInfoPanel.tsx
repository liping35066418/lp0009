import React from 'react';
import { PlacedModel } from '../types';
import { getModelById } from '../data/modelLibrary';

interface ModelInfoPanelProps {
  placedModel: PlacedModel | null;
  onClose: () => void;
  onRotate: (id: string, degrees: number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({
  placedModel,
  onClose,
  onRotate,
  onDelete,
  onDuplicate
}) => {
  if (!placedModel) return null;

  const modelInfo = getModelById(placedModel.modelId);
  if (!modelInfo) return null;

  const currentRotation = ((placedModel.rotation[1] * 180) / Math.PI) % 360;

  return (
    <div className="model-info-panel">
      <div className="info-header">
        <h3>📦 {modelInfo.name}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="info-body">
        <div className="info-section">
          <h4>参考尺寸</h4>
          <div className="dimensions-grid">
            <div className="dim-item">
              <span className="dim-label">宽</span>
              <span className="dim-value">{modelInfo.dimensions.width}m</span>
            </div>
            <div className="dim-item">
              <span className="dim-label">深</span>
              <span className="dim-value">{modelInfo.dimensions.depth}m</span>
            </div>
            <div className="dim-item">
              <span className="dim-label">高</span>
              <span className="dim-value">{modelInfo.dimensions.height}m</span>
            </div>
          </div>
        </div>

        {modelInfo.description && (
          <div className="info-section">
            <h4>说明</h4>
            <p className="description">{modelInfo.description}</p>
          </div>
        )}

        <div className="info-section">
          <h4>位置</h4>
          <div className="position-info">
            X: {placedModel.position[0].toFixed(2)}m &nbsp;
            Z: {placedModel.position[2].toFixed(2)}m
          </div>
        </div>

        <div className="info-section">
          <h4>旋转角度</h4>
          <div className="rotation-display">{currentRotation.toFixed(0)}°</div>
        </div>
      </div>

      <div className="info-actions">
        <button className="action-btn rotate-btn" onClick={() => onRotate(placedModel.id, -45)}>
          ↺ 左转
        </button>
        <button className="action-btn rotate-btn" onClick={() => onRotate(placedModel.id, 45)}>
          ↻ 右转
        </button>
        <button className="action-btn duplicate-btn" onClick={() => onDuplicate(placedModel.id)}>
          📋 复制
        </button>
        <button className="action-btn delete-btn" onClick={() => onDelete(placedModel.id)}>
          🗑️ 删除
        </button>
      </div>
    </div>
  );
};
