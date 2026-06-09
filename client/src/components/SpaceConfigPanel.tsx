import React from 'react';
import { SpaceConfig } from '../types';

interface SpaceConfigPanelProps {
  spaceConfig: SpaceConfig;
  onChange: (config: SpaceConfig) => void;
}

export const SpaceConfigPanel: React.FC<SpaceConfigPanelProps> = ({
  spaceConfig,
  onChange
}) => {
  const handleChange = (field: keyof SpaceConfig, value: number) => {
    onChange({
      ...spaceConfig,
      [field]: Math.max(2, Math.min(30, value))
    });
  };

  return (
    <div className="space-config-panel">
      <h3>📐 场地尺寸</h3>
      <div className="config-row">
        <label>
          <span>宽度 (m)</span>
          <input
            type="number"
            min="2"
            max="30"
            step="0.5"
            value={spaceConfig.width}
            onChange={(e) => handleChange('width', parseFloat(e.target.value) || 2)}
          />
        </label>
      </div>
      <div className="config-row">
        <label>
          <span>深度 (m)</span>
          <input
            type="number"
            min="2"
            max="30"
            step="0.5"
            value={spaceConfig.depth}
            onChange={(e) => handleChange('depth', parseFloat(e.target.value) || 2)}
          />
        </label>
      </div>
      <div className="config-row preset-row">
        <span className="preset-label">预设:</span>
        <button onClick={() => onChange({ width: 4, depth: 3 })}>阳台</button>
        <button onClick={() => onChange({ width: 6, depth: 5 })}>小院</button>
        <button onClick={() => onChange({ width: 10, depth: 8 })}>花园</button>
      </div>
      <div className="area-info">
        面积: <strong>{(spaceConfig.width * spaceConfig.depth).toFixed(1)} m²</strong>
      </div>
    </div>
  );
};
