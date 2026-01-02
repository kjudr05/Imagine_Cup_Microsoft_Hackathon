import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function Avatar() {
  const avatarRef = useRef();
  const wsRef = useRef(null);

  const [action, setAction] = useState("IDLE");

  // ---- WebSocket Connection ----
  useEffect(() => {
    if (wsRef.current) return;

    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 Avatar connected to backend");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "gloss" && msg.sequence?.length) {
        console.log("✋ Gloss received:", msg.sequence);
        setAction(msg.sequence[0]); // React to first word
      }
    };

    ws.onerror = (err) => console.error("WS error", err);
    ws.onclose = () => console.log("🔴 Avatar WS closed");

    return () => ws.close();
  }, []);

  // ---- Animation Loop ----
  useFrame((state, delta) => {
    if (!avatarRef.current) return;

    switch (action) {
      case "ME":
        avatarRef.current.rotation.y += delta * 2;
        break;

      case "YOU":
        avatarRef.current.rotation.y -= delta * 2;
        break;

      case "GO":
        avatarRef.current.position.z -= delta * 2;
        break;

      case "TOMORROW":
        avatarRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
        break;

      default:
        avatarRef.current.rotation.y *= 0.95;
    }
  });

  return (
    <mesh ref={avatarRef} position={[0, 1, 0]}>
      <boxGeometry args={[1, 2, 0.5]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
