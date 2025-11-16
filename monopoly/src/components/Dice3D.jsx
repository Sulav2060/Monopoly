import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// Individual dice component
const Die = ({ value, position, isRolling, onRollComplete, index, startPosition }) => {
  const meshRef = useRef();
  const [targetRotation, setTargetRotation] = useState([0, 0, 0]);
  const [currentRotation, setCurrentRotation] = useState([0, 0, 0]);
  const [rollTime, setRollTime] = useState(0);
  const [startPos, setStartPos] = useState(startPosition || position);
  const rollDuration = 2.5; // seconds

  // Dice face rotations to show specific values - all face front (value 1 position)
  const getDiceRotation = (value) => {
    // All values will show face 1 (front) but we'll change which face has which dots
    return [0, 0, 0]; // Always face the camera
  };

  useEffect(() => {
    if (isRolling) {
      setRollTime(0);
      setStartPos(startPosition || position);
      // Set initial rotation to current rotation
      setCurrentRotation([
        meshRef.current?.rotation.x || 0,
        meshRef.current?.rotation.y || 0,
        meshRef.current?.rotation.z || 0,
      ]);
      // Add random spins during rolling
      const finalRotation = getDiceRotation(value);
      const spins = 3 + Math.random() * 2; // 3-5 full rotations
      setTargetRotation([
        finalRotation[0] + spins * Math.PI * 2,
        finalRotation[1] + spins * Math.PI * 2,
        finalRotation[2] + spins * Math.PI * 2,
      ]);
    }
  }, [isRolling, value, startPosition]);

  useFrame((state, delta) => {
    if (meshRef.current && isRolling) {
      setRollTime((prev) => prev + delta);

      // Easing function for smooth deceleration
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const progress = Math.min(rollTime / rollDuration, 1);
      const easedProgress = easeOutCubic(progress);

      // Interpolate rotation
      meshRef.current.rotation.x =
        currentRotation[0] +
        (targetRotation[0] - currentRotation[0]) * easedProgress;
      meshRef.current.rotation.y =
        currentRotation[1] +
        (targetRotation[1] - currentRotation[1]) * easedProgress;
      meshRef.current.rotation.z =
        currentRotation[2] +
        (targetRotation[2] - currentRotation[2]) * easedProgress;

      // Animate position from start to center with arc
      const arcHeight = 2; // Height of the throw arc
      const throwProgress = easedProgress;
      
      // Interpolate X and Z from start to final position
      meshRef.current.position.x = 
        startPos[0] + (position[0] - startPos[0]) * throwProgress;
      meshRef.current.position.z = 
        startPos[2] + (position[2] - startPos[2]) * throwProgress;
      
      // Create arc trajectory for Y axis
      const parabola = Math.sin(throwProgress * Math.PI);
      meshRef.current.position.y = position[1] + parabola * arcHeight;

      // When animation completes - set to exact final rotation
      if (progress >= 1 && rollTime >= rollDuration) {
        const finalRot = getDiceRotation(value);
        meshRef.current.rotation.set(...finalRot);
        meshRef.current.position.set(...position);
        setCurrentRotation(finalRot);
        if (onRollComplete && index === 0) {
          // Only call once from first die
          onRollComplete();
        }
      }
    } else if (meshRef.current && !isRolling) {
      // Keep dice at exact rotation and position when not rolling
      const finalRot = getDiceRotation(value);
      meshRef.current.rotation.set(...finalRot);
      meshRef.current.position.set(...position);
    }
  });

  // Dice dots configuration
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
    <group rotation={[rotationX, rotationY, 0]}>
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
      {/* Main dice cube */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#ff3333"
        roughness={0.3}
        metalness={0.1}
      />

      {/* Show the current value on the front face */}
      {createFace(value, 0, 0)} {/* Front - shows current value */}
      {createFace(6, Math.PI, 0)} {/* Back */}
      {createFace(2, Math.PI / 2, 0)} {/* Right */}
      {createFace(5, -Math.PI / 2, 0)} {/* Left */}
      {createFace(3, 0, -Math.PI / 2)} {/* Top */}
      {createFace(4, 0, Math.PI / 2)} {/* Bottom */}
    </mesh>
  );
};

// Scene component
const DiceScene = ({ dice1Value, dice2Value, isRolling, onRollComplete, currentPlayerIndex, totalPlayers }) => {
  // Calculate starting position based on current player and total players
  const getThrowStartPosition = (dieIndex) => {
    const playerIndex = currentPlayerIndex || 0;
    const numPlayers = totalPlayers || 2;
    
    // Define start positions based on player index and number of players
    if (numPlayers === 2) {
      // 2 players: alternate between bottom (0) and top (1)
      if (playerIndex === 0) {
        // Player 1: throw from bottom
        return [dieIndex === 0 ? -1.5 : 1.5, 3, 3];
      } else {
        // Player 2: throw from top
        return [dieIndex === 0 ? -1.5 : 1.5, 3, -3];
      }
    } else if (numPlayers === 3) {
      // 3 players: bottom (0), top (1), right (2)
      if (playerIndex === 0) {
        // Player 1: throw from bottom
        return [dieIndex === 0 ? -1.5 : 1.5, 3, 3];
      } else if (playerIndex === 1) {
        // Player 2: throw from top (opposite)
        return [dieIndex === 0 ? -1.5 : 1.5, 3, -3];
      } else {
        // Player 3: throw from right
        return [3, 3, dieIndex === 0 ? -1.5 : 1.5];
      }
    } else {
      // 4 players: bottom (0), right (1), top (2), left (3)
      if (playerIndex === 0) {
        // Player 1: throw from bottom
        return [dieIndex === 0 ? -1.5 : 1.5, 3, 3];
      } else if (playerIndex === 1) {
        // Player 2: throw from right
        return [3, 3, dieIndex === 0 ? -1.5 : 1.5];
      } else if (playerIndex === 2) {
        // Player 3: throw from top
        return [dieIndex === 0 ? -1.5 : 1.5, 3, -3];
      } else {
        // Player 4: throw from left
        return [-3, 3, dieIndex === 0 ? -1.5 : 1.5];
      }
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} />

      <Die
        value={dice1Value}
        position={[-1.3, 0, 0]}
        startPosition={getThrowStartPosition(0)}
        isRolling={isRolling}
        onRollComplete={onRollComplete}
        index={0}
      />
      <Die
        value={dice2Value}
        position={[1.3, 0, 0]}
        startPosition={getThrowStartPosition(1)}
        isRolling={isRolling}
        onRollComplete={null}
        index={1}
      />

      {/* Ground plane for shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </>
  );
};

// Main Dice3D component
const Dice3D = ({ dice1, dice2, isRolling, onRollComplete, currentPlayerIndex, totalPlayers }) => {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <DiceScene
          dice1Value={dice1}
          dice2Value={dice2}
          isRolling={isRolling}
          onRollComplete={onRollComplete}
          currentPlayerIndex={currentPlayerIndex}
          totalPlayers={totalPlayers}
        />
      </Canvas>
    </div>
  );
};

export default Dice3D;
