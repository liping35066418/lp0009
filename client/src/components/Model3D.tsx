import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { getModelById } from '../data/modelLibrary';

interface Model3DProps {
  modelId: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  selected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>, groupRef: React.RefObject<THREE.Group>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}

export const Model3D: React.FC<Model3DProps> = ({
  modelId,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  selected = false,
  onClick,
  onPointerDown,
  onPointerUp
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const model = getModelById(modelId);

  const geometry = useMemo(() => createModelGeometry(modelId), [modelId]);
  const baseColor = model?.color || '#888888';

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onPointerDown={(e) => onPointerDown && onPointerDown(e, groupRef)}
      onPointerUp={onPointerUp}
    >
      {geometry}
      {selected && (
        <lineSegments>
          <edgesGeometry args={[createBoundingBox(modelId)]} />
          <lineBasicMaterial color="#ff9800" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};

function createBoundingBox(modelId: string): THREE.BufferGeometry {
  const model = getModelById(modelId);
  if (!model) return new THREE.BoxGeometry(1, 1, 1);
  const { width, depth, height } = model.dimensions;
  return new THREE.BoxGeometry(width * 1.02, height * 1.02, depth * 1.02);
}

function createModelGeometry(modelId: string): React.ReactNode {
  switch (modelId) {
    case 'ground-grass':
      return (
        <mesh position={[0, 0.025, 0]} receiveShadow>
          <boxGeometry args={[2, 0.05, 2]} />
          <meshStandardMaterial color="#4a7c23" roughness={0.9} />
        </mesh>
      );

    case 'ground-wood':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[2, 0.1, 1.5]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
          </mesh>
          {[...Array(4)].map((_, i) => (
            <mesh key={i} position={[-0.75 + i * 0.5, 0.101, 0]} receiveShadow>
              <boxGeometry args={[0.02, 0.005, 1.5]} />
              <meshStandardMaterial color="#5d3a1a" />
            </mesh>
          ))}
        </group>
      );

    case 'ground-stone':
      return (
        <group>
          {[[-0.25, -0.1], [0.25, -0.05], [-0.15, 0.15], [0.2, 0.2]].map((pos, i) => (
            <mesh key={i} position={[pos[0], 0.025, pos[1]]} rotation={[0, i * 0.3, 0]} receiveShadow>
              <boxGeometry args={[0.35, 0.05, 0.22]} />
              <meshStandardMaterial color={i % 2 ? '#9e9e9e' : '#808080'} roughness={0.95} />
            </mesh>
          ))}
        </group>
      );

    case 'ground-gravel':
      return (
        <group>
          <mesh position={[0, 0.015, 0]} receiveShadow>
            <boxGeometry args={[1.5, 0.03, 1.5]} />
            <meshStandardMaterial color="#d4d4d4" roughness={1} />
          </mesh>
          {[...Array(30)].map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 1.4,
                0.035,
                (Math.random() - 0.5) * 1.4
              ]}
            >
              <sphereGeometry args={[0.015 + Math.random() * 0.01, 6, 6]} />
              <meshStandardMaterial color={['#e0e0e0', '#bdbdbd', '#eeeeee'][i % 3]} />
            </mesh>
          ))}
        </group>
      );

    case 'stand-wood-shelf':
      return (
        <group>
          {[0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[0, y + 0.05, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.04, 0.4]} />
              <meshStandardMaterial color="#a0522d" roughness={0.6} />
            </mesh>
          ))}
          {[[-0.37, -0.17], [0.37, -0.17], [-0.37, 0.17], [0.37, 0.17]].map((pos, i) => (
            <mesh key={i} position={[pos[0], 0.6, pos[1]]} castShadow>
              <boxGeometry args={[0.04, 1.2, 0.04]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          ))}
        </group>
      );

    case 'stand-metal-rack':
      return (
        <group>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.03, 0.5]} />
            <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.3} />
          </mesh>
          {[[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].map((pos, i) => (
            <mesh key={i} position={[pos[0], 0.225, pos[1]]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      );

    case 'stand-ladder':
      return (
        <group>
          {[0, 0.37, 0.74, 1.11].map((y, i) => (
            <mesh key={i} position={[0, y + 0.03, -0.08 + i * 0.05]} castShadow receiveShadow>
              <boxGeometry args={[1.0 - i * 0.1, 0.04, 0.35]} />
              <meshStandardMaterial color="#deb887" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[-0.4, 0.75, 0.05]} rotation={[0, 0, -0.15]} castShadow>
            <boxGeometry args={[0.03, 1.5, 0.03]} />
            <meshStandardMaterial color="#c4a373" />
          </mesh>
          <mesh position={[0.4, 0.75, 0.05]} rotation={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[0.03, 1.5, 0.03]} />
            <meshStandardMaterial color="#c4a373" />
          </mesh>
        </group>
      );

    case 'stand-hanging':
      return (
        <group>
          <mesh position={[0, 0.7, 0]}>
            <torusGeometry args={[0.12, 0.02, 8, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
          {[0, 2.09, 4.18].map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * 0.1, 0.35, Math.sin(a) * 0.1]} rotation={[0, 0, a]}>
              <cylinderGeometry args={[0.008, 0.008, 0.5, 6]} />
              <meshStandardMaterial color="#a0a0a0" />
            </mesh>
          ))}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.2, 16]} />
            <meshStandardMaterial color="#d7ccc8" />
          </mesh>
        </group>
      );

    case 'plant-rose':
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.24, 16]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
          {[[0.1, 0.35, 0], [-0.08, 0.4, 0.08], [0, 0.42, -0.1], [0.08, 0.32, 0.12]].map((p, i) => (
            <mesh key={i} position={[p[0], p[1], p[2]]} castShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={['#e63946', '#ff6b6b', '#e63946', '#ff8a80'][i]} />
            </mesh>
          ))}
        </group>
      );

    case 'plant-succulent':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.11, 0.1, 16]} />
            <meshStandardMaterial color="#78909c" />
          </mesh>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 0.08;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * r, 0.12 + Math.abs(Math.sin(angle)) * 0.03, Math.sin(angle) * r]}
                rotation={[Math.PI / 4, 0, angle]}
                castShadow
              >
                <coneGeometry args={[0.04, 0.1, 6]} />
                <meshStandardMaterial color={['#7cb342', '#8bc34a', '#9ccc65', '#7cb342'][i % 4]} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#689f38" />
          </mesh>
        </group>
      );

    case 'plant-lavender':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color="#4caf50" />
          </mesh>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const r = 0.1 + Math.random() * 0.03;
            return (
              <group key={i} position={[Math.cos(angle) * r * 0.5, 0.35, Math.sin(angle) * r * 0.5]}>
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.02, 0.015, 0.1, 6]} />
                  <meshStandardMaterial color="#7e57c2" />
                </mesh>
                <mesh position={[0, 0.12, 0]}>
                  <sphereGeometry args={[0.025, 6, 6]} />
                  <meshStandardMaterial color="#9575cd" />
                </mesh>
              </group>
            );
          })}
        </group>
      );

    case 'plant-bonsai':
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.35, 0.12, 0.25]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.05, 0.15, 8]} />
            <meshStandardMaterial color="#4e342e" />
          </mesh>
          <mesh position={[-0.08, 0.28, 0]} rotation={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.1, 8]} />
            <meshStandardMaterial color="#4e342e" />
          </mesh>
          <mesh position={[0.08, 0.3, 0.05]} rotation={[0, 0, -0.2]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.12, 8]} />
            <meshStandardMaterial color="#4e342e" />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <dodecahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
          <mesh position={[-0.18, 0.35, 0.05]} castShadow>
            <dodecahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color="#388e3c" />
          </mesh>
          <mesh position={[0.16, 0.38, -0.05]} castShadow>
            <dodecahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial color="#43a047" />
          </mesh>
        </group>
      );

    case 'plant-bamboo':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#bcaaa4" />
          </mesh>
          {[-0.06, 0, 0.06].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
              <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.02, 0.9, 8]} />
                <meshStandardMaterial color="#4caf50" />
              </mesh>
              {[0.2, 0.45, 0.7].map((y, j) => (
                <mesh key={j} position={[0, y, 0]}>
                  <torusGeometry args={[0.018, 0.005, 6, 12]} />
                  <meshStandardMaterial color="#388e3c" />
                </mesh>
              ))}
              {[0.3, 0.55, 0.8].map((y, j) => (
                <mesh key={j} position={[j % 2 ? 0.06 : -0.06, y, 0]} rotation={[0, 0, j % 2 ? 0.5 : -0.5]}>
                  <coneGeometry args={[0.02, 0.15, 4]} />
                  <meshStandardMaterial color="#66bb6a" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );

    case 'plant-small-tree':
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.8, 10]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.0, 0]} castShadow>
            <sphereGeometry args={[0.4, 12, 10]} />
            <meshStandardMaterial color="#33691e" />
          </mesh>
          <mesh position={[-0.25, 0.9, 0.15]} castShadow>
            <sphereGeometry args={[0.25, 10, 8]} />
            <meshStandardMaterial color="#388e3c" />
          </mesh>
          <mesh position={[0.22, 0.95, -0.12]} castShadow>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial color="#43a047" />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#4caf50" />
          </mesh>
        </group>
      );

    case 'plant-tulip':
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.6, 0.12, 0.4]} />
            <meshStandardMaterial color="#795548" />
          </mesh>
          {[[-0.2, -0.1], [0, -0.08], [0.2, -0.1], [-0.1, 0.08], [0.1, 0.1]].map((p, i) => (
            <group key={i} position={[p[0], 0.12, p[1]]}>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.008, 0.01, 0.2, 5]} />
                <meshStandardMaterial color="#4caf50" />
              </mesh>
              <mesh position={[0, 0.22, 0]}>
                <sphereGeometry args={[0.05, 8, 6]} />
                <meshStandardMaterial color={['#ff5722', '#e91e63', '#ffeb3b', '#9c27b0', '#f44336'][i]} />
              </mesh>
              <mesh position={[0.03, 0.14, 0]} rotation={[0, 0, 0.5]}>
                <coneGeometry args={[0.015, 0.1, 4]} />
                <meshStandardMaterial color="#66bb6a" />
              </mesh>
            </group>
          ))}
        </group>
      );

    case 'plant-fern':
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.16, 16]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          {[...Array(9)].map((_, i) => {
            const angle = (i / 9) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.1, 0.15, Math.sin(angle) * 0.1]}
                rotation={[-0.3, angle, 0]}
                castShadow
              >
                <coneGeometry args={[0.06, 0.35, 4]} />
                <meshStandardMaterial color={['#558b2f', '#689f38', '#7cb342'][i % 3]} />
              </mesh>
            );
          })}
        </group>
      );

    case 'water-fountain':
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.32, 0.16, 20]} />
            <meshStandardMaterial color="#78909c" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.05, 20]} />
            <meshStandardMaterial color="#b3e5fc" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.3, 12]} />
            <meshStandardMaterial color="#90a4ae" />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.2, 0.1, 20]} />
            <meshStandardMaterial color="#b0bec5" />
          </mesh>
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
            <meshStandardMaterial color="#81d4fa" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#78909c" />
          </mesh>
        </group>
      );

    case 'water-pond':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[1.2, 0.2, 0.8]} />
            <meshStandardMaterial color="#546e7a" />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[1.1, 0.08, 0.7]} />
            <meshStandardMaterial color="#4fc3f7" transparent opacity={0.8} />
          </mesh>
          {[[-0.4, -0.25], [0.35, 0.25], [-0.2, 0.3]].map((p, i) => (
            <mesh key={i} position={[p[0], 0.2, p[1]]} rotation={[0, i, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 0.03, 8]} />
              <meshStandardMaterial color="#7cb342" />
            </mesh>
          ))}
          {[0.2, -0.3].map((x, i) => (
            <mesh key={i} position={[x, 0.21, i ? 0.15 : -0.1]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#ff9800" />
            </mesh>
          ))}
        </group>
      );

    case 'water-birdbath':
      return (
        <group>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.5, 12]} />
            <meshStandardMaterial color="#78909c" />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.18, 0.08, 16]} />
            <meshStandardMaterial color="#90a4ae" />
          </mesh>
          <mesh position={[0, 0.59, 0]}>
            <cylinderGeometry args={[0.19, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#4fc3f7" transparent opacity={0.8} />
          </mesh>
        </group>
      );

    case 'ornament-bench':
      return (
        <group>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.2, 0.06, 0.5]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          <mesh position={[0, 0.72, -0.22]} castShadow>
            <boxGeometry args={[1.2, 0.5, 0.05]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          {[[-0.55, 0.2], [0.55, 0.2]].map((p, i) => (
            <mesh key={i} position={[p[0], 0.25, p[1]]} castShadow>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color="#4e342e" />
            </mesh>
          ))}
          {[[-0.55, -0.2], [0.55, -0.2]].map((p, i) => (
            <mesh key={i} position={[p[0], 0.25, p[1]]} castShadow>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color="#4e342e" />
            </mesh>
          ))}
        </group>
      );

    case 'ornament-table':
      return (
        <group>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 24]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.45, 12]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.04, 20]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
        </group>
      );

    case 'ornament-lantern':
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.025, 0.4, 10]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.12, 0.18, 0.12]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.09, 0.14, 0.09]} />
            <meshStandardMaterial
              color="#ffc107"
              emissive="#ff9800"
              emissiveIntensity={0.6}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0, 0.61, 0]} castShadow>
            <coneGeometry args={[0.09, 0.06, 4]} />
            <meshStandardMaterial color="#424242" />
          </mesh>
        </group>
      );

    case 'ornament-statue':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.28, 0.08, 0.22]} />
            <meshStandardMaterial color="#b0bec5" />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.15, 10]} />
            <meshStandardMaterial color="#eceff1" />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          <mesh position={[-0.08, 0.33, 0]} rotation={[0, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.12, 6]} />
            <meshStandardMaterial color="#eceff1" />
          </mesh>
          <mesh position={[0.08, 0.35, 0]} rotation={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 6]} />
            <meshStandardMaterial color="#eceff1" />
          </mesh>
        </group>
      );

    case 'ornament-hammock':
      return (
        <group>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          {[[-0.5, 1.3], [0.5, 1.3]].map((p, i) => (
            <group key={i}>
              <mesh position={[p[0], 1.1, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 1.0, 6]} />
                <meshStandardMaterial color="#6d4c41" />
              </mesh>
              <mesh position={[p[0] * 0.5, 1.55, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.4, 4]} />
                <meshStandardMaterial color="#a1887f" />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.7, 0]} rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.45, 0.15, 16, 1, true]} />
            <meshStandardMaterial color="#d7ccc8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 1.0, 8]} />
            <meshStandardMaterial color="#4e342e" />
          </mesh>
        </group>
      );

    case 'ornament-birdhouse':
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.2, 0.18, 0.2]} />
            <meshStandardMaterial color="#a1887f" />
          </mesh>
          <mesh position={[0, 0.12, 0.1]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 10]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>
          <mesh position={[0, 0.27, 0]} castShadow>
            <coneGeometry args={[0.16, 0.12, 4]} />
            <meshStandardMaterial color="#795548" />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.06, 6]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
        </group>
      );

    case 'ornament-windchime':
      return (
        <group>
          <mesh position={[0, 0.65, 0]}>
            <torusGeometry args={[0.08, 0.01, 6, 16]} />
            <meshStandardMaterial color="#b0bec5" metalness={0.8} roughness={0.3} />
          </mesh>
          {[-0.06, 0, 0.06].map((x, i) => (
            <group key={i}>
              <mesh position={[x, 0.4, 0]}>
                <cylinderGeometry args={[0.003, 0.003, 0.45, 4]} />
                <meshStandardMaterial color="#78909c" />
              </mesh>
              <mesh position={[x, 0.15 + i * 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.012, 0.15, 8]} />
                <meshStandardMaterial
                  color={['#ffcc80', '#a5d6a7', '#90caf9'][i]}
                  metalness={0.5}
                />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#cfd8dc" />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={getModelById(modelId)?.color || '#888888'} />
        </mesh>
      );
  }
}
