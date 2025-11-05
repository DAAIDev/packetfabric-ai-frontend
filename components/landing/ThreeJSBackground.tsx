'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreeJSBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let particles: THREE.Points, group: THREE.Group;
    let mouseX = 0, mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function init() {
      // Scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
      camera.position.z = 1000;

      // Particles
      const material = new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 2,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
        opacity: 0.8
      });

      const geometry = new THREE.BufferGeometry();
      const particleCount = 20000;
      const positions = new Float32Array(particleCount * 3);
      const radius = 600;

      for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i] = radius * Math.cos(theta) * Math.sin(phi);
        positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i + 2] = radius * Math.cos(phi);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles = new THREE.Points(geometry, material);

      group = new THREE.Group();
      group.add(particles);
      scene.add(group);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      mount!.appendChild(renderer.domElement);

      // Event Listeners
      document.addEventListener('mousemove', onDocumentMouseMove, false);
      window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onDocumentMouseMove(event: MouseEvent) {
      mouseX = (event.clientX - windowHalfX) * 0.1;
      mouseY = (event.clientY - windowHalfY) * 0.1;
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      const time = Date.now() * 0.00005;

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      group.rotation.y = time * 0.5;
      group.rotation.x = time * 0.2;

      renderer.render(scene, camera);
    }

    init();
    animate();

    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', onWindowResize);
      if (renderer && mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}
