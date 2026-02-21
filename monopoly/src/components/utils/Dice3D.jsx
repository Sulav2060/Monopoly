import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three-stdlib";
import { Environment, ContactShadows } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";

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
  onDiceClick,
}) => {
  const meshRef = useRef();
  const [rollTime, setRollTime] = useState(0);
  const [startRot, setStartRot] = useState([0, 0, 0]);
  const [targetValue, setTargetValue] = useState(value);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(null);
  const [dragReleasePos, setDragReleasePos] = useState(null);
  const { size, viewport } = useThree();
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

  const bind = useDrag(
    ({ active, movement: [x, y], memo, timeStamp }) => {
      // If no dice click handler (e.g. not my turn) or already rolling, ignore
      if (!onDiceClick || isRolling) return;

      if (active) {
        if (!isDragging) setIsDragging(true);
        // Map screen pixels to 3D world units (X and Z plane)
        const x3d = (x / size.width) * viewport.width;
        const z3d = (y / size.height) * viewport.height;

        // Memo stores the initial position at start of drag
        if (!memo) {
          memo = [meshRef.current.position.x, meshRef.current.position.z];
        }

        const newPos = [memo[0] + x3d, 2, memo[1] + z3d]; // Lift to y=2
        setDragPosition(newPos);
        document.body.style.cursor = "grabbing";
        return memo;
      } else {
        setIsDragging(false);
        setDragReleasePos(dragPosition || [position[0], 2, position[2]]);
        setDragPosition(null);
        document.body.style.cursor = "grab";
        if (onDiceClick) onDiceClick();
      }
    },
    { pointerEvents: true }
  );

  useEffect(() => {
    if (isRolling) {
      setTargetValue(value);
      setRollTime(0);
      setStartRot([
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ]);
    } else {
      // Reset drag release pos if not rolling (turn end or reset)
      // Actually we want to keep it just for the start of the roll
      // If turn ended, we probably want to clear it, but it matters most at start of roll.
    }
  }, [isRolling, value, index]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Handle Dragging
    if (isDragging && dragPosition) {
      meshRef.current.position.set(dragPosition[0], dragPosition[1], dragPosition[2]);
      // Add a little tilts while dragging for realism
      meshRef.current.rotation.x += delta * 2;
      meshRef.current.rotation.z += delta * 1.5;
      return;
    }

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
        
        // Use Drag Release Position as start if available, else 'startPosition' prop
        const effectiveStart = dragReleasePos || startPosition;
        const startX = effectiveStart[0];
        const startY = effectiveStart[1];
        const startZ = effectiveStart[2];

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
          // Clear drag release pos after roll done
          if (dragReleasePos) setDragReleasePos(null);
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
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      {...bind()}
      onClick={(e) => {
        // e.stopPropagation(); // handled by bind
        // if (onDiceClick && !isRolling) onDiceClick(); // handled by bind
      }}
      onPointerOver={() => {
        if (onDiceClick && !isRolling) {
          setHovered(true);
          document.body.style.cursor = "grab";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      scale={hovered && onDiceClick && !isRolling ? 1.1 : 1}
    >
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
  onDiceClick,
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
      {/* Environment Map adds realistic reflections of a studio - commented out for offline support */}
      {/* <Environment preset="studio" />  */}
      {/* todo: take feedback and use previous with offline support/new dice */}
      <ambientLight intensity={0.5} />

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
        onDiceClick={onDiceClick}
      />
      <Die
        value={dice2Value}
        position={finalDie2Pos}
        startPosition={getThrowStartPosition(1)}
        isRolling={isRolling}
        onRollComplete={null}
        index={1}
        onDiceClick={onDiceClick}
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
  onDiceClick,
}) => {
  return (
    <div className="w-full h-full" style={{ minHeight: '100%', minWidth: '100%' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
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
            onDiceClick={onDiceClick}
          />
        </group>
      </Canvas>
    </div>
  );
};

export default Dice3D;
