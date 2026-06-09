import React from 'react';

interface ToolbarProps {
  onScreenshot: () => void;
  onClearAll: () => void;
  onResetView: () => void;
  modelCount: number;
  isSaving: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onScreenshot,
  onClearAll,
  onResetView,
  modelCount,
  isSaving
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="app-title">
          <span className="logo">🌿</span>
          <span>3D庭院设计工具</span>
        </div>
        <div className="model-counter">
          已放置: <strong>{modelCount}</strong> 件
        </div>
      </div>

      <div className="toolbar-actions">
        <button className="tool-btn" onClick={onResetView} title="重置视角">
          🔄 重置视角
        </button>
        <button className="tool-btn screenshot-btn" onClick={onScreenshot} disabled={isSaving}>
          {isSaving ? '⏳ 保存中...' : '📸 截图保存'}
        </button>
        <button className="tool-btn danger-btn" onClick={onClearAll}>
          🗑️ 清空场景
        </button>
      </div>

      <div className="toolbar-hint">
        <span>🖱️ 左键拖拽模型 | 右键/中键旋转视角 | 滚轮缩放</span>
      </div>
    </div>
  );
};
