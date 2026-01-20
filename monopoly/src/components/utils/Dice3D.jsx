import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three-stdlib";
import { Environment, ContactShadows } from "@react-three/drei";

const CameraTopFixed = () => {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(0, 12, 0.1);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

const Die = ({
  value,
  position,
  isRolling,
  onRollComplete,
  index,
  startPosition,
}) => {
  const meshRef = useRef();
  const [rollTime, setRollTime] = useState(0);
  const [startRot, setStartRot] = useState([0, 0, 0]);
  const [targetValue, setTargetValue] = useState(value);
  const rollDuration = 0.8;

  const getDiceRotationForTop = (topValue) => {
    const rotations = {
      1: [-Math.PI / 2, 0, 0],
      2: [0, 0, Math.PI / 2],
      3: [Math.PI, 0, 0],
      4: [0, 0, 0],
      5: [0, 0, -Math.PI / 2],
      6: [Math.PI / 2, 0, 0],
    };
    return rotations[topValue] || [0, 0, 0];
  };

  useEffect(() => {
    if (isRolling) {
      setTargetValue(value);
      setRollTime(0);
      setStartRot([
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ]);
    }
  }, [isRolling, value, index]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isRolling) {
      setRollTime((prev) => {
        const newTime = prev + delta;
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const progress = Math.min(newTime / rollDuration, 1);
        const easedProgress = easeOutCubic(progress);

        const targetRot = getDiceRotationForTop(targetValue);
        const spins = 3;

        meshRef.current.rotation.x =
          startRot[0] +
          (targetRot[0] - startRot[0] + spins * Math.PI * 2) * easedProgress;
        meshRef.current.rotation.y =
          startRot[1] +
          (targetRot[1] - startRot[1] + spins * Math.PI * 2) * easedProgress;
        meshRef.current.rotation.z =
          startRot[2] +
          (targetRot[2] - startRot[2] + spins * Math.PI * 2) * easedProgress;

        const startX = startPosition[0];
        const startY = startPosition[1];
        const startZ = startPosition[2];

        meshRef.current.position.x =
          startX + (position[0] - startX) * easedProgress;
        meshRef.current.position.z =
          startZ + (position[2] - startZ) * easedProgress;

        const arcHeight = 3;
        const parabola = Math.sin(progress * Math.PI);
        meshRef.current.position.y =
          startY +
          (position[1] - startY) * easedProgress +
          parabola * arcHeight;

        if (progress >= 1) {
          meshRef.current.rotation.set(...targetRot);
          meshRef.current.position.set(...position);
          if (onRollComplete && index === 0) {
            setTimeout(() => onRollComplete(), 100);
          }
        }
        return newTime;
      });
    } else {
      const finalRot = getDiceRotationForTop(targetValue);
      meshRef.current.rotation.set(...finalRot);
      meshRef.current.position.set(...position);
    }
  });

  const dots = {
    1: [[0, 0]],
    2: [
      [-0.3, 0.3],
      [0.3, -0.3],
    ],
    3: [
      [-0.3, 0.3],
      [0, 0],
      [0.3, -0.3],
    ],
    4: [
      [-0.3, 0.3],
      [0.3, 0.3],
      [-0.3, -0.3],
      [0.3, -0.3],
    ],
    5: [
      [-0.3, 0.3],
      [0.3, 0.3],
      [0, 0],
      [-0.3, -0.3],
      [0.3, -0.3],
    ],
    6: [
      [-0.3, 0.3],
      [0.3, 0.3],
      [-0.3, 0],
      [0.3, 0],
      [-0.3, -0.3],
      [0.3, -0.3],
    ],
  };

  // Modern, flat dots that sit flush on the surface
  const createFace = (faceValue, rotationY, rotationX = 0) => (
    <group
      rotation={[rotationX, rotationY, 0]}
      key={`face-${faceValue}-${rotationY}-${rotationX}`}
    >
      {dots[faceValue]?.map((dot, idx) => (
        <mesh
          key={idx}
          // Positioned slightly above the face (0.501) to avoid Z-fighting
          position={[dot[0], dot[1], 0.501]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          {/* Flatter cylinder, higher segments for a perfect circle */}
          <cylinderGeometry args={[0.08, 0.08, 0.001, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  );

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      {/* Soft glow shell slightly larger than the die */}
      <primitive object={new RoundedBoxGeometry(1.08, 1.08, 1.08, 8, 0.2)} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#dfe7ff" // silvery white glow
        emissiveIntensity={0.6} // brighter for dark backgrounds
        transparent
        opacity={0.55}
        roughness={0.9}
        metalness={0.05}
      />

      {/* Core die geometry */}
      <primitive object={new RoundedBoxGeometry(1, 1, 1, 8, 0.18)} />
      {/* Physical Material creates that realistic high-gloss plastic look */}
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.15} // Very smooth
        metalness={0.0} // Plastic, not metal
        clearcoat={1} // Adds a polish layer
        clearcoatRoughness={0.1}
        reflectivity={1}
      />
      {createFace(1, 0, 0)}
      {createFace(6, Math.PI, 0)}
      {createFace(2, Math.PI / 2, 0)}
      {createFace(5, -Math.PI / 2, 0)}
      {createFace(3, 0, Math.PI / 2)}
      {createFace(4, 0, -Math.PI / 2)}
    </mesh>
  );
};

const DiceScene = ({
  dice1Value,
  dice2Value,
  isRolling,
  onRollComplete,
  currentPlayerIndex,
  totalPlayers,
}) => {
  const finalDie1Pos = [-1.3, 0, 0];
  const finalDie2Pos = [1.3, 0, 0];

  const getThrowStartPosition = (dieIndex) => {
    const playerIndex = currentPlayerIndex || 0;
    const numPlayers = totalPlayers || 2;
    const height = 6;
    const offset = dieIndex === 0 ? -1.5 : 1.5;

    const startPositions = {
      2: [
        [offset, height, 6],
        [offset, height, -6],
      ],
      3: [
        [offset, height, 6],
        [-6, height, offset],
        [offset, height, -6],
      ],
      4: [
        [offset, height, 6],
        [-6, height, offset],
        [offset, height, -6],
        [6, height, offset],
      ],
    };

    return startPositions[numPlayers]?.[playerIndex] || [offset, height, 6];
  };

  return (
    <>
      {/* Environment Map adds realistic reflections of a studio */}
      <Environment preset="studio" />

      {/* Main Directional Light for casting shadows */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Fill lights */}
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="white" />

      <Die
        value={dice1Value}
        position={finalDie1Pos}
        startPosition={getThrowStartPosition(0)}
        isRolling={isRolling}
        onRollComplete={onRollComplete}
        index={0}
      />
      <Die
        value={dice2Value}
        position={finalDie2Pos}
        startPosition={getThrowStartPosition(1)}
        isRolling={isRolling}
        onRollComplete={null}
        index={1}
      />

      {/* Contact Shadows provide realistic grounding soft shadows */}
      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4.5}
      />
    </>
  );
};

const Dice3D = ({
  dice1,
  dice2,
  isRolling,
  onRollComplete,
  currentPlayerIndex,
  totalPlayers,
}) => {
  return (
    <div className="w-full h-full pointer-events-none" style={{ minHeight: '100%', minWidth: '100%' }}>
      <Canvas
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        camera={{
          position: [0, 12, 0.1],
          fov: 35, // Reduced FOV slightly for a more "product photography" telephoto look
          up: [0, 0, -1],
        }}
        shadows
        gl={{ antialias: true, alpha: true }} // alpha true for transparent background if needed
        dpr={[1, 2]} // Handle high DPI screens
        resize={{ scroll: false }} // prevent resize loops
      >
        <CameraTopFixed />
        <group>
          <DiceScene
            dice1Value={dice1}
            dice2Value={dice2}
            isRolling={isRolling}
            onRollComplete={onRollComplete}
            currentPlayerIndex={currentPlayerIndex}
            totalPlayers={totalPlayers}
          />
        </group>
      </Canvas>
    </div>
  );
};

export default Dice3D;
