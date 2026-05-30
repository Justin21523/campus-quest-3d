import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

interface Props {
  smoothness?: number;
}

export default function FollowCamera({ 
  smoothness = 10,
}: Props) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { gl } = useThree();
  const playerPosition = useGameStore((s) => s.playerPosition);
  const setCameraYaw = useGameStore((s) => s.setCameraYaw);
  const yaw = useRef(Math.PI);
  const pitch = useRef(0.22);
  const distance = useRef(4.8);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 2) return;
      isDragging.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      element.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current) return;

      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };

      yaw.current -= dx * 0.006;
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.004, -0.25, 0.65);
      setCameraYaw(yaw.current);
    };

    const onPointerUp = (event: PointerEvent) => {
      isDragging.current = false;
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
    };

    const onWheel = (event: WheelEvent) => {
      distance.current = THREE.MathUtils.clamp(distance.current + event.deltaY * 0.004, 2.8, 7.5);
    };

    const onContextMenu = (event: MouseEvent) => event.preventDefault();

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);
    element.addEventListener('wheel', onWheel, { passive: true });
    element.addEventListener('contextmenu', onContextMenu);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl, setCameraYaw]);

  useFrame((_, delta) => {
    if (!cameraRef.current || !playerPosition) return;

    const target = new THREE.Vector3(playerPosition.x, playerPosition.y + 1.15, playerPosition.z);
    const horizontalDistance = Math.cos(pitch.current) * distance.current;
    const desiredPosition = new THREE.Vector3(
      target.x + Math.sin(yaw.current) * horizontalDistance,
      target.y + Math.sin(pitch.current) * distance.current,
      target.z + Math.cos(yaw.current) * horizontalDistance,
    );

    cameraRef.current.position.lerp(desiredPosition, 1 - Math.exp(-smoothness * delta));
    cameraRef.current.lookAt(target);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={58} near={0.3} far={3000} />;
}
