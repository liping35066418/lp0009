import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { SpaceConfig, PlacedModel } from './types';
import { Scene3D } from './components/Scene3D';
import { SpaceConfigPanel } from './components/SpaceConfigPanel';
import { ModelLibrary } from './components/ModelLibrary';
import { ModelInfoPanel } from './components/ModelInfoPanel';
import { Toolbar } from './components/Toolbar';
import { PlacedItemsList } from './components/PlacedItemsList';
import { getModelById } from './data/modelLibrary';

const API_BASE = window.location.port === '3000' ? '/api' : '/api';

function App() {
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig>({
    width: 8,
    depth: 6
  });
  const [placedModels, setPlacedModels] = useState<PlacedModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const glRef = useRef<any>(null);
  const canvasKeyRef = useRef(0);

  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(data => {
        setSpaceConfig({
          width: data.defaultSpaceWidth,
          depth: data.defaultSpaceDepth
        });
      })
      .catch(() => {});
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const generateId = () => `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddModel = useCallback((modelId: string) => {
    const modelInfo = getModelById(modelId);
    if (!modelInfo) return;

    const halfW = spaceConfig.width / 2;
    const halfD = spaceConfig.depth / 2;
    const mW = modelInfo.dimensions.width / 2;
    const mD = modelInfo.dimensions.depth / 2;

    const newModel: PlacedModel = {
      id: generateId(),
      modelId,
      position: [
        Math.max(-halfW + mW, Math.min(halfW - mW, (Math.random() - 0.5) * (spaceConfig.width - 1))),
        0,
        Math.max(-halfD + mD, Math.min(halfD - mD, (Math.random() - 0.5) * (spaceConfig.depth - 1)))
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    };

    setPlacedModels(prev => [...prev, newModel]);
    setSelectedModelId(newModel.id);
    showToast(`已添加: ${modelInfo.name}`);
  }, [spaceConfig, showToast]);

  const handleUpdatePosition = useCallback((id: string, position: [number, number, number]) => {
    setPlacedModels(prev =>
      prev.map(m => m.id === id ? { ...m, position } : m)
    );
  }, []);

  const handleRotate = useCallback((id: string, degrees: number) => {
    setPlacedModels(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const newY = m.rotation[1] + (degrees * Math.PI) / 180;
        return { ...m, rotation: [m.rotation[0], newY, m.rotation[2]] };
      })
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setPlacedModels(prev => prev.filter(m => m.id !== id));
    if (selectedModelId === id) setSelectedModelId(null);
    showToast('已删除模型', 'success');
  }, [selectedModelId, showToast]);

  const handleDuplicate = useCallback((id: string) => {
    const model = placedModels.find(m => m.id === id);
    if (!model) return;

    const offset = 0.5;
    const newModel: PlacedModel = {
      ...model,
      id: generateId(),
      position: [
        model.position[0] + offset,
        model.position[1],
        model.position[2] + offset
      ]
    };

    setPlacedModels(prev => [...prev, newModel]);
    setSelectedModelId(newModel.id);
    showToast('已复制模型');
  }, [placedModels, showToast]);

  const handleClearAll = useCallback(() => {
    if (placedModels.length === 0) return;
    if (!confirm('确定要清空场景中的所有模型吗？')) return;
    setPlacedModels([]);
    setSelectedModelId(null);
    showToast('场景已清空');
  }, [placedModels.length, showToast]);

  const handleResetView = useCallback(() => {
    canvasKeyRef.current += 1;
    showToast('视角已重置');
  }, [showToast]);

  const handleScreenshot = useCallback(async () => {
    if (!glRef.current) {
      showToast('截图失败，场景未就绪', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const gl = glRef.current;
      gl.render(gl.scene, gl.camera);
      const dataURL = gl.domElement.toDataURL('image/png');

      const response = await fetch(`${API_BASE}/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataURL,
          name: `garden_design_${spaceConfig.width}x${spaceConfig.depth}`
        })
      });

      const result = await response.json();
      if (result.success) {
        const link = document.createElement('a');
        link.download = result.fileName;
        link.href = dataURL;
        link.click();
        showToast(`截图已保存! 共${placedModels.length}件物品`);
      } else {
        showToast(result.error || '保存失败', 'error');
      }
    } catch (err) {
      console.error(err);
      const link = document.createElement('a');
      link.download = `garden_design_${Date.now()}.png`;
      link.href = glRef.current.domElement.toDataURL('image/png');
      link.click();
      showToast('截图已下载到本地');
    } finally {
      setIsSaving(false);
    }
  }, [spaceConfig, placedModels.length, showToast]);

  const selectedModel = placedModels.find(m => m.id === selectedModelId) || null;

  return (
    <div className="app">
      <Toolbar
        onScreenshot={handleScreenshot}
        onClearAll={handleClearAll}
        onResetView={handleResetView}
        modelCount={placedModels.length}
        isSaving={isSaving}
      />

      <div className="main-content">
        <aside className="left-sidebar">
          <SpaceConfigPanel
            spaceConfig={spaceConfig}
            onChange={setSpaceConfig}
          />
          <ModelLibrary onAddModel={handleAddModel} />
        </aside>

        <main className="canvas-container">
          <Canvas
            key={canvasKeyRef.current}
            shadows
            gl={{
              antialias: true,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance'
            }}
            dpr={[1, 2]}
          >
            <color attach="background" args={['#e3f2fd']} />
            <Scene3D
              spaceConfig={spaceConfig}
              placedModels={placedModels}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              onUpdateModelPosition={handleUpdatePosition}
              glRef={glRef}
            />
          </Canvas>

          <div className="canvas-overlay">
            <div className="space-size-badge">
              {spaceConfig.width}m × {spaceConfig.depth}m
            </div>
          </div>
        </main>

        <aside className="right-sidebar">
          <PlacedItemsList
            placedModels={placedModels}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            onDelete={handleDelete}
          />

          <ModelInfoPanel
            placedModel={selectedModel}
            onClose={() => setSelectedModelId(null)}
            onRotate={handleRotate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />

          {!selectedModel && (
            <div className="help-panel">
              <h3>💡 使用指南</h3>
              <ul className="help-list">
                <li>从左侧选择<b>场地尺寸</b>或自定义输入</li>
                <li>从<b>素材库</b>点击模型添加到场景</li>
                <li><b>拖拽</b>场景中的模型调整位置</li>
                <li>点击模型可<b>旋转、复制、删除</b></li>
                <li><b>右键拖动</b>可360°旋转视角</li>
                <li><b>滚轮</b>缩放查看细节</li>
                <li>设计完成后<b>截图保存</b>方案</li>
              </ul>
            </div>
          )}
        </aside>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
