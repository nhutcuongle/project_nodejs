import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";

function QuestionMarkModel({ onClick, isUserInteracting }) {
  const gltf = useGLTF("/assets/question_mark.glb");
  const modelRef = useRef();

  // Quay tự động nếu người dùng không đang tương tác
  useFrame(() => {
    if (modelRef.current && !isUserInteracting.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      scale={0.3}
      position={[0, -1.2, 0]}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    />
  );
}

export default function QuestionMark3D() {
  const navigate = useNavigate();
  const isUserInteracting = useRef(false);
  const controlsRef = useRef();

  return (
    <Canvas style={{ height: 250 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 5]} />
      <QuestionMarkModel
        onClick={() => navigate("/home")}
        isUserInteracting={isUserInteracting}
      />
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        onStart={() => (isUserInteracting.current = true)}
        onEnd={() => (isUserInteracting.current = false)}
      />
    </Canvas>
  );
}
