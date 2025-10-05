import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
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

// Component to load and display STL models
function STLModel({ url }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const geometry = useLoader(STLLoader, url);
  
  // Center and scale the geometry
  geometry.computeBoundingBox();
  const center = geometry.boundingBox.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 4 / maxDim;
  geometry.scale(scale, scale, scale);

  return (
    <group ref={meshRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          color="#d32f2f" 
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

// Component to load and display 3D models
function Model({ url, fallbackImage }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  // If we have a valid STL URL, use the STL loader
  if (url && url.endsWith('.stl')) {
    return (
      <Suspense fallback={<Loading />}>
        <STLModel url={url} />
      </Suspense>
    );
  }

  // Fallback to placeholder if no URL or not STL file
  return <FallbackModel />;
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