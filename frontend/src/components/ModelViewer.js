import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useFBX, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './ModelViewer.css';

// Fallback component for when model fails to load
function FallbackModel() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>
      <Html center>
        <div className="model-loading">
          <p>3D Model Preview</p>
          <small>Model will be available when database is connected</small>
        </div>
      </Html>
    </group>
  );
}

// Component to load and display 3D models
function Model({ url, fallbackImage }) {
  const [error, setError] = useState(false);
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  // For now, show a placeholder since we don't have actual 3D files
  // In production, this would load the actual STL/OBJ files
  if (error || !url) {
    return <FallbackModel />;
  }

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>
      <Html center>
        <div className="model-placeholder">
          <img src={fallbackImage} alt="3D Model Preview" className="model-preview-image" />
          <p>3D Model Preview</p>
          <small>Interactive 3D view will be available with database integration</small>
        </div>
      </Html>
    </group>
  );
}

// Loading component
function Loading() {
  return (
    <Html center>
      <div className="model-loading">
        <div className="loading-spinner"></div>
        <p>Loading 3D Model...</p>
      </div>
    </Html>
  );
}

const ModelViewer = ({ 
  modelUrl, 
  fallbackImage, 
  width = '100%', 
  height = '400px',
  showControls = true,
  autoRotate = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Random fallback images for demo purposes
  const randomImages = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
  ];

  const selectedImage = fallbackImage || randomImages[Math.floor(Math.random() * randomImages.length)];

  return (
    <div className="model-viewer" style={{ width, height }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={() => setIsLoading(false)}
      >
        <Suspense fallback={<Loading />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="studio" />
          
          <Model 
            url={modelUrl} 
            fallbackImage={selectedImage}
          />
          
          {showControls && (
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>
      
      <div className="model-viewer-controls">
        <div className="control-info">
          <span>🖱️ Drag to rotate</span>
          <span>🔍 Scroll to zoom</span>
          <span>📱 Pan to move</span>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;