import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { SpaceConfig, PlacedModel } from '../types';
import { Model3D } from './Model3D';
import { getModelById } from '../data/modelLibrary';

interface Scene3DProps {
  spaceConfig: SpaceConfig;
  placedModels: PlacedModel[];
  selectedModelId: string | null;
  onSelectModel: (id: string | null) => void;
  onUpdateModelPosition: (id: string, position: [number, number, number]) => void;
  glRef?: React.MutableRefObject<any>;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  spaceConfig,
  placedModels,
  selectedModelId,
  onSelectModel,
  onUpdateModelPosition,
  glRef
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const offsetRef = useRef(new THREE.Vector3());
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    if (glRef) {
      glRef.current = gl;
    }
  }, [gl, glRef]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>, model: PlacedModel) => {
    e.stopPropagation();
    setDraggingId(model.id);
    onSelectModel(model.id);

    const worldPosition = new THREE.Vector3(...model.position);
    const intersection = new THREE.Vector3();
    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersection);
    offsetRef.current.copy(worldPosition).sub(intersection);

    (e.target as any).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingId) return;

    const rect = gl.domElement.getBoundingClientRect();
    pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const intersection = new THREE.Vector3();
    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersection)) {
      const newPos = intersection.add(offsetRef.current);
      const halfW = spaceConfig.width / 2;
      const halfD = spaceConfig.depth / 2;
      const modelInfo = getModelById(placedModels.find(m => m.id === draggingId)?.modelId || '');
      const mW = (modelInfo?.dimensions.width || 0.5) / 2;
      const mD = (modelInfo?.dimensions.depth || 0.5) / 2;

      newPos.x = Math.max(-halfW + mW, Math.min(halfW - mW, newPos.x));
      newPos.z = Math.max(-halfD + mD, Math.min(halfD - mD, newPos.z));
      newPos.y = 0;

      onUpdateModelPosition(draggingId, [newPos.x, newPos.y, newPos.z]);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    setDraggingId(null);
    (e.target as any).releasePointerCapture?.(e.pointerId);
  };

  const handleCanvasClick = (e: ThreeEvent<MouseEvent>) => {
    if ((e.target as any).isGround) {
      onSelectModel(null);
    }
  };

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[
          spaceConfig.width * 0.8,
          Math.max(spaceConfig.width, spaceConfig.depth) * 0.7,
          spaceConfig.depth * 0.8
        ]}
        fov={50}
      />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={Math.max(spaceConfig.width, spaceConfig.depth) * 4}
        maxPolarAngle={Math.PI / 2.05}
        enablePan={!draggingId}
      />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-spaceConfig.width}
        shadow-camera-right={spaceConfig.width}
        shadow-camera-top={spaceConfig.depth}
        shadow-camera-bottom={-spaceConfig.depth}
      />
      <hemisphereLight args={['#87ceeb', '#8fbc8f', 0.4]} />

      <group onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onClick={handleCanvasClick}>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
          userData={{ isGround: true }}
        >
          <planeGeometry args={[spaceConfig.width, spaceConfig.depth]} />
          <meshStandardMaterial color="#c8e6c9" roughness={1} />
        </mesh>

        <Grid
          position={[0, 0.001, 0]}
          args={[Math.max(spaceConfig.width, spaceConfig.depth) * 2, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#9ccc65"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#7cb342"
          fadeDistance={Math.max(spaceConfig.width, spaceConfig.depth) * 3}
          fadeStrength={1}
          infiniteGrid={false}
        />

        <lineSegments position={[0, 0.002, 0]}>
          <edgesGeometry
            args={[
              new THREE.BoxGeometry(spaceConfig.width, 0, spaceConfig.depth)
            ]}
          />
          <lineBasicMaterial color="#2e7d32" />
        </lineSegments>

        {placedModels.map(model => (
          <Model3D
            key={model.id}
            modelId={model.modelId}
            position={model.position}
            rotation={model.rotation}
            scale={model.scale}
            selected={selectedModelId === model.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectModel(model.id);
            }}
            onPointerDown={(e) => handlePointerDown(e, model)}
            onPointerUp={handlePointerUp}
          />
        ))}
      </group>

      <fog attach="fog" args={['#e8f5e9', Math.max(spaceConfig.width, spaceConfig.depth) * 2, Math.max(spaceConfig.width, spaceConfig.depth) * 5]} />
    </>
  );
};
