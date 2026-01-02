import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

function Avatar({ queue }) {
  const rightArm = useRef();
  const leftArm = useRef();
  const [current, setCurrent] = useState(null);

  // Play gloss sequence one by one
  useEffect(() => {
    if (queue.length > 0 && !current) {
      setCurrent(queue[0]);
    }
  }, [queue, current]);

  // Advance queue
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setCurrent(null), 900);
    return () => clearTimeout(timer);
  }, [current]);

  useFrame(() => {
    if (!rightArm.current || !leftArm.current) return;

    // Reset
    rightArm.current.rotation.set(0, 0, 0);
    leftArm.current.rotation.set(0, 0, 0);

    const t = Date.now() * 0.008;

    if (current === "HELLO") {
      rightArm.current.rotation.z = Math.sin(t) * 0.6;
    }

    if (current === "ME") {
      rightArm.current.rotation.x = Math.sin(t) * 0.6;
    }

    if (current === "YOU") {
      rightArm.current.rotation.y = -1.0;
    }

    if (current === "NAME") {
      rightArm.current.rotation.x = Math.sin(t) * 0.4;
      leftArm.current.rotation.x = Math.sin(t) * 0.4;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* Arms */}
      <mesh ref={rightArm} position={[0.75, 1.4, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      <mesh ref={leftArm} position={[-0.75, 1.4, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
}

export default function App() {
  const [queue, setQueue] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (wsRef.current) return;

    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => console.log("🟢 Avatar connected");

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "gloss") {
        console.log("✋ Gloss sequence:", msg.sequence);
        setQueue(msg.sequence);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
      wsRef.current = null;
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 2, 6], fov: 40 }}
      style={{ background: "#eef2f7" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Environment preset="city" />
      <Avatar queue={queue} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
