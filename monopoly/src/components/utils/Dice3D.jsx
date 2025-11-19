import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

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
  const [targetValue, setTargetValue] = useState(value); // Lock the target value
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

  // Lock in the target value when rolling starts
  useEffect(() => {
    if (isRolling) {
      console.log(`Die ${index} starting roll to value: ${value}`);
      setTargetValue(value); // Lock the target value
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

        // Use the locked targetValue instead of value prop
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
          console.log(
            `Die ${index} finished rolling, showing value: ${targetValue}`
          );
          if (onRollComplete && index === 0) {
            setTimeout(() => onRollComplete(), 100);
          }
        }
        return newTime;
      });
    } else {
      // When not rolling, show the target value (last rolled value)
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

  const createFace = (faceValue, rotationY, rotationX = 0) => (
    <group
      rotation={[rotationX, rotationY, 0]}
      key={`face-${faceValue}-${rotationY}-${rotationX}`}
    >
      <mesh position={[0, 0, 0.51]}>
        <planeGeometry args={[0.95, 0.95]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {dots[faceValue]?.map((dot, idx) => (
        <mesh key={idx} position={[dot[0], dot[1], 0.52]}>
          <circleGeometry args={[0.12, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.2} />
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

    // Define starting positions for each player based on board layout
    // Bottom, Left, Top, Right positions for each player
    const startPositions = {
      2: [
        [offset, height, 6], // Player 0 (You) - bottom
        [offset, height, -6], // Player 1 (Bot 1) - top
      ],
      3: [
        [offset, height, 6], // Player 0 (You) - bottom
        [-6, height, offset], // Player 1 (Bot 1) - left
        [offset, height, -6], // Player 2 (Bot 2) - top
      ],
      4: [
        [offset, height, 6], // Player 0 (You) - bottom
        [-6, height, offset], // Player 1 (Bot 1) - left
        [offset, height, -6], // Player 2 (Bot 2) - top
        [6, height, offset], // Player 3 (Bot 3) - right
      ],
    };

    return startPositions[numPlayers]?.[playerIndex] || [offset, height, 6];
  };

  console.log(
    "DiceScene rendering with values:",
    dice1Value,
    dice2Value,
    "isRolling:",
    isRolling
  );

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 8, -5]} intensity={1} />
      <pointLight position={[0, 10, 0]} intensity={1.5} />
      <pointLight position={[-5, 5, 5]} intensity={0.7} />
      <pointLight position={[5, 5, -5]} intensity={0.7} />

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

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.51, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
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
  console.log("Dice3D props:", { dice1, dice2, isRolling });

  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas
        camera={{
          position: [0, 12, 0.1],
          fov: 45,
          up: [0, 0, -1],
        }}
        shadows
        gl={{ antialias: true }}
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
