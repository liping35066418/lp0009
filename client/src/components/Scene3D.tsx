import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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
  const orbitControlsRef = useRef<any>(null);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const offsetRef = useRef(new THREE.Vector3());
  const draggingIdRef = useRef<string | null>(null);
  const capturedPointerIdRef = useRef<number | null>(null);
  const hasMovedRef = useRef(false);
  const downClientRef = useRef({ x: 0, y: 0 });
  const placeIdToObjectRef = useRef<Map<string, THREE.Object3D>>(new Map());

  const spaceConfigRef = useRef(spaceConfig);
  const placedModelsRef = useRef(placedModels);
  const selectedModelIdRef = useRef(selectedModelId);
  const onSelectModelRef = useRef(onSelectModel);
  const onUpdateModelPositionRef = useRef(onUpdateModelPosition);

  const { camera, gl, scene } = useThree();

  const [, forceRender] = useState(0);

  useEffect(() => {
    if (glRef) {
      glRef.current = gl;
    }
  }, [gl, glRef]);

  useEffect(() => {
    spaceConfigRef.current = spaceConfig;
  }, [spaceConfig]);

  useEffect(() => {
    placedModelsRef.current = placedModels;
  }, [placedModels]);

  useEffect(() => {
    selectedModelIdRef.current = selectedModelId;
  }, [selectedModelId]);

  useEffect(() => {
    onSelectModelRef.current = onSelectModel;
  }, [onSelectModel]);

  useEffect(() => {
    onUpdateModelPositionRef.current = onUpdateModelPosition;
  }, [onUpdateModelPosition]);

  const computePointer = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    pointerRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl]);

  const clampPositionToBounds = useCallback((pos: THREE.Vector3, modelId: string): THREE.Vector3 => {
    const cfg = spaceConfigRef.current;
    const modelInfo = getModelById(modelId);
    const halfW = cfg.width / 2;
    const halfD = cfg.depth / 2;
    const mW = (modelInfo?.dimensions.width || 0.5) / 2;
    const mD = (modelInfo?.dimensions.depth || 0.5) / 2;
    pos.x = Math.max(-halfW + mW, Math.min(halfW - mW, pos.x));
    pos.z = Math.max(-halfD + mD, Math.min(halfD - mD, pos.z));
    pos.y = 0;
    return pos;
  }, []);

  const doDragMove = useCallback((clientX: number, clientY: number) => {
    const id = draggingIdRef.current;
    if (!id) return false;

    const models = placedModelsRef.current;
    const model = models.find(m => m.id === id);
    if (!model) return false;

    computePointer(clientX, clientY);
    const intersection = new THREE.Vector3();
    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersection)) {
      const newPos = intersection.clone().add(offsetRef.current);
      clampPositionToBounds(newPos, model.modelId);
      onUpdateModelPositionRef.current(id, [newPos.x, newPos.y, newPos.z]);
      return true;
    }
    return false;
  }, [camera, computePointer, clampPositionToBounds]);

  const endDrag = useCallback(() => {
    if (capturedPointerIdRef.current !== null) {
      try {
        gl.domElement.releasePointerCapture(capturedPointerIdRef.current);
      } catch (_) {}
      capturedPointerIdRef.current = null;
    }
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }
    draggingIdRef.current = null;
    forceRender(n => n + 1);
  }, [gl]);

  const beginDragByModel = useCallback((model: PlacedModel, clientX: number, clientY: number, pointerId: number) => {
    draggingIdRef.current = model.id;
    hasMovedRef.current = false;
    downClientRef.current = { x: clientX, y: clientY };

    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
    }

    if (pointerId !== undefined && pointerId !== -1) {
      try {
        gl.domElement.setPointerCapture(pointerId);
        capturedPointerIdRef.current = pointerId;
      } catch (_) {
        capturedPointerIdRef.current = null;
      }
    }

    computePointer(clientX, clientY);
    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    const intersection = new THREE.Vector3();
    if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersection)) {
      const worldPos = new THREE.Vector3(...model.position);
      offsetRef.current.copy(worldPos).sub(intersection);
    } else {
      offsetRef.current.set(0, 0, 0);
    }

    onSelectModelRef.current(model.id);
    forceRender(n => n + 1);
  }, [gl, camera, computePointer]);

  const hitTest = useCallback((clientX: number, clientY: number): PlacedModel | null => {
    computePointer(clientX, clientY);
    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(scene.children, true);
    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (obj.userData && obj.userData.placedModelId) {
          const id = obj.userData.placedModelId;
          const found = placedModelsRef.current.find(m => m.id === id);
          if (found) return found;
        }
        obj = obj.parent;
      }
    }
    return null;
  }, [camera, scene, computePointer]);

  const hitTestGround = useCallback((clientX: number, clientY: number): boolean => {
    computePointer(clientX, clientY);
    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(scene.children, true);
    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (obj.userData && obj.userData.isGround) {
          return true;
        }
        obj = obj.parent;
      }
    }
    return false;
  }, [camera, scene, computePointer]);

  useEffect(() => {
    console.log('[Scene3D] Event useEffect mounting...');
    const canvas = gl.domElement as HTMLElement;
    const doc = document;

    const isOnCanvas = (e: PointerEvent): boolean => {
      const r = canvas.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right
          && e.clientY >= r.top && e.clientY <= r.bottom;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!isOnCanvas(e)) return;
      const button = (e as any).button ?? 0;
      if (button !== 0) return;

      const model = hitTest(e.clientX, e.clientY);
      if (model) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        beginDragByModel(model, e.clientX, e.clientY, e.pointerId);
      } else {
        downClientRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (draggingIdRef.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const dx = Math.abs(e.clientX - downClientRef.current.x);
        const dy = Math.abs(e.clientY - downClientRef.current.y);
        if (dx > 3 || dy > 3) {
          hasMovedRef.current = true;
        }
        doDragMove(e.clientX, e.clientY);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (draggingIdRef.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        endDrag();
      } else if (isOnCanvas(e)) {
        const button = (e as any).button ?? 0;
        if (button === 0) {
          const dx = Math.abs(e.clientX - downClientRef.current.x);
          const dy = Math.abs(e.clientY - downClientRef.current.y);
          if (dx <= 3 && dy <= 3) {
            if (hitTestGround(e.clientX, e.clientY)) {
              onSelectModelRef.current(null);
            }
          }
        }
      }
    };

    const onPointerCancel = (_e: PointerEvent) => {
      if (draggingIdRef.current) {
        endDrag();
      }
    };

    doc.addEventListener('pointerdown', onPointerDown, true);
    doc.addEventListener('pointermove', onPointerMove, true);
    doc.addEventListener('pointerup', onPointerUp, true);
    doc.addEventListener('pointercancel', onPointerCancel, true);

    const win = window as any;
    console.log('[Scene3D] Attaching debug API');
    win.__debugScene3D = {
      hitTest: (cx: number, cy: number) => {
        const m = hitTest(cx, cy);
        return m ? { id: m.id, modelId: m.modelId, position: m.position } : null;
      },
      dragStart: (cx: number, cy: number) => {
        const m = hitTest(cx, cy);
        if (!m) return { ok: false, reason: 'no hit' };
        beginDragByModel(m, cx, cy, -1);
        return { ok: true, id: m.id, startPos: m.position };
      },
      dragMove: (cx: number, cy: number) => {
        const id = draggingIdRef.current;
        if (!id) return { ok: false, reason: 'not dragging' };
        const ok = doDragMove(cx, cy);
        const m = placedModelsRef.current.find((x: PlacedModel) => x.id === id);
        return { ok, id, curPos: m?.position };
      },
      dragEnd: () => {
        const id = draggingIdRef.current;
        endDrag();
        return { ok: true, wasId: id };
      },
      getPlacedObjectIds: () => {
        const ids: string[] = [];
        scene.traverse(o => { if (o.userData?.placedModelId) ids.push(o.userData.placedModelId); });
        return ids;
      },
      getRayAt: (cx: number, cy: number) => {
        computePointer(cx, cy);
        raycasterRef.current.setFromCamera(pointerRef.current, camera);
        const inter = new THREE.Vector3();
        const ok = raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, inter);
        return ok ? { x: inter.x, y: inter.y, z: inter.z } : null;
      },
      isOrbitEnabled: () => orbitControlsRef.current ? orbitControlsRef.current.enabled : 'no ref',
      getDraggingId: () => draggingIdRef.current,
      scanHitPoints: () => {
        const cr = canvas.getBoundingClientRect();
        const hits = [];
        const stepX = Math.max(1, Math.floor(cr.width / 10));
        const stepY = Math.max(1, Math.floor(cr.height / 10));
        for (let y = Math.floor(cr.top); y < cr.bottom; y += stepY) {
          for (let x = Math.floor(cr.left); x < cr.right; x += stepX) {
            const r = hitTest(x, y);
            if (r) hits.push({ x, y, id: r.id, position: r.position });
          }
        }
        return hits;
      }
    };

    return () => {
      doc.removeEventListener('pointerdown', onPointerDown, true);
      doc.removeEventListener('pointermove', onPointerMove, true);
      doc.removeEventListener('pointerup', onPointerUp, true);
      doc.removeEventListener('pointercancel', onPointerCancel, true);
      delete win.__debugScene3D;
      console.log('[Scene3D] Event useEffect cleanup');
    };
  }, [gl, camera, scene, computePointer, doDragMove, endDrag, beginDragByModel, hitTest, hitTestGround]);

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
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={Math.max(spaceConfig.width, spaceConfig.depth) * 4}
        maxPolarAngle={Math.PI / 2.05}
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

      <group>
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
          <PlacedModelWrapper
            key={model.id}
            placedModelId={model.id}
            modelId={model.modelId}
            position={model.position}
            rotation={model.rotation}
            scale={model.scale}
            selected={selectedModelId === model.id}
          />
        ))}
      </group>

      <fog attach="fog" args={['#e8f5e9', Math.max(spaceConfig.width, spaceConfig.depth) * 2, Math.max(spaceConfig.width, spaceConfig.depth) * 5]} />
    </>
  );
};

interface PlacedModelWrapperProps {
  placedModelId: string;
  modelId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  selected: boolean;
}

const PlacedModelWrapper: React.FC<PlacedModelWrapperProps> = ({
  placedModelId,
  modelId,
  position,
  rotation,
  scale,
  selected
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.placedModelId = placedModelId;
    }
  }, [placedModelId]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <Model3D
        modelId={modelId}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
        selected={selected}
      />
    </group>
  );
};
