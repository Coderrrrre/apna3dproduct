import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Box,
  ChevronDown,
  ChevronUp,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export type StudioModelId = 'plate' | 'gym' | 'lamp';

interface FilamentOption {
  id: string;
  name: string;
  hex: string;
  accentHex: string;
}

const STUDIO_FILAMENTS: FilamentOption[] = [
  { id: 'teal', name: 'Deep Teal', hex: '#1F6E72', accentHex: '#F8FAFC' },
  { id: 'charcoal', name: 'Matte Charcoal', hex: '#1F2937', accentHex: '#F8FAFC' },
  { id: 'crimson', name: 'Crimson Red', hex: '#C8232C', accentHex: '#FFFFFF' },
  { id: 'white', name: 'Arctic White', hex: '#F1F5F9', accentHex: '#111827' },
  { id: 'amber', name: 'Saffron Gold', hex: '#D97706', accentHex: '#FFFBEB' },
];

const MODEL_META: Record<
  StudioModelId,
  {
    label: string;
    productId: string;
    defaultText: string;
    placeholder: string;
    dimensions: string;
    material: string;
  }
> = {
  plate: {
    label: 'Number Plate Keychain',
    productId: 'prod-number-plate',
    defaultText: 'MH 12 AP 3024',
    placeholder: 'e.g. GJ 05 KL 9081',
    dimensions: '62 × 22 × 4 mm',
    material: 'Dual-Layer Matte PLA+',
  },
  gym: {
    label: 'Gym Weight Plate',
    productId: 'prod-gym-plate',
    defaultText: '20 KG · APNA',
    placeholder: 'e.g. 25 KG · RAHUL',
    dimensions: '46 × 46 × 6 mm',
    material: 'High-Infill Tough PLA+',
  },
  lamp: {
    label: 'Shadow Mandala Lamp',
    productId: 'prod-krishna-lamp',
    defaultText: 'APNA STUDIO',
    placeholder: 'Engraved base text',
    dimensions: '125 × 125 × 240 mm',
    material: 'Ivory PLA + Teak Base',
  },
};

interface ThreeDShowcaseSectionProps {
  onCustomizeProductId: (productId: string) => void;
}

function createRoundedRectShape(width: number, height: number, radius: number) {
  const s = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}

function createPlateCanvasTexture(
  text: string,
  baseHex: string,
  textHex: string,
  maxAniso: number
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle FDM layer-line micro grain
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.045)';
  ctx.lineWidth = 2;
  for (let y = 0; y < canvas.height; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // IND blue band on left
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(28, 24, 118, canvas.height - 48);

  // Micro Chakra emblem
  ctx.strokeStyle = '#E0F2FE';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(87, 132, 28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 38px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('IND', 87, 252);

  // Registration text
  const cleanText = (text || 'MH 12 AP 3024').toUpperCase().slice(0, 16);
  ctx.fillStyle = textHex;
  ctx.font = '800 94px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cleanText, 574, canvas.height / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.needsUpdate = true;
  return tex;
}

function createGymPlateTexture(
  text: string,
  baseHex: string,
  textHex: string,
  maxAniso: number
) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Concentric calibration rings
  ctx.strokeStyle = textHex;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 320, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 175, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Curved / top & bottom crisp text
  const parts = (text || '20 KG · APNA').toUpperCase().split('·');
  const topLabel = (parts[0] || '20 KG').trim().slice(0, 12);
  const bottomLabel = (parts[1] || 'APNA 3D').trim().slice(0, 12);

  ctx.fillStyle = textHex;
  ctx.font = '800 58px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(topLabel, cx, cy - 220);
  ctx.font = '700 44px "JetBrains Mono", monospace';
  ctx.fillText(bottomLabel, cx, cy + 225);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.needsUpdate = true;
  return tex;
}

function createWoodGrainTexture(maxAniso: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#B88758';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(110, 68, 32, 0.16)' : 'rgba(235, 198, 152, 0.14)';
    ctx.lineWidth = 2 + (i % 4);
    const y = (i / 90) * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + ((i % 5) - 2) * 5, 340, y - ((i % 4) - 2) * 4, 512, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAniso;
  return tex;
}

function createMandalaPatternTexture(baseHex: string, maxAniso: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Architectural mandala lotus lattice cutouts
  const cols = 8;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = ((c + (r % 2) * 0.5) * canvas.width) / cols;
      const cy = ((r + 0.5) * canvas.height) / rows;
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FFF7ED';
      for (let p = 0; p < 8; p++) {
        const angle = (p / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(angle) * 24,
          cy + Math.sin(angle) * 24,
          10,
          5,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = maxAniso;
  return tex;
}

function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.34)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.12)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const ThreeDShowcaseSection: React.FC<ThreeDShowcaseSectionProps> = ({
  onCustomizeProductId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<StudioModelId>('plate');
  const [selectedFilament, setSelectedFilament] = useState<FilamentOption>(
    STUDIO_FILAMENTS[0]
  );
  const [customText, setCustomText] = useState<string>(MODEL_META.plate.defaultText);
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  // Sync default preview text when switching models cleanly
  const handleSelectModel = (modelId: StudioModelId) => {
    setSelectedModel(modelId);
    setCustomText(MODEL_META[modelId].defaultText);
    setExploded(false);
  };

  // Refs synced into the rAF loop so scene doesn't rebuild unnecessarily
  const autoRotateRef = useRef(autoRotate);
  const explodedRef = useRef(exploded);
  const resetTriggerRef = useRef(0);
  const requestRenderRef = useRef<() => void>(() => {});
  const rebuildModelRef = useRef<() => void>(() => {});

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    requestRenderRef.current();
  }, [autoRotate]);

  useEffect(() => {
    explodedRef.current = exploded;
    requestRenderRef.current();
  }, [exploded]);

  useEffect(() => {
    resetTriggerRef.current = resetSignal;
    requestRenderRef.current();
  }, [resetSignal]);

  const activeConfigRef = useRef({
    model: selectedModel,
    filament: selectedFilament,
    text: customText,
  });

  useEffect(() => {
    activeConfigRef.current = {
      model: selectedModel,
      filament: selectedFilament,
      text: customText,
    };
    rebuildModelRef.current();
  }, [selectedModel, selectedFilament, customText]);

  const meta = useMemo(() => MODEL_META[selectedModel], [selectedModel]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('3D WebGL preview is unavailable on this browser.');
      return;
    }

    const gl = renderer.getContext();
    const debugExt = gl.getExtension('WEBGL_DEBUG_RENDERER_INFO');
    const rendererString = debugExt
      ? String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const isSoftwareGl = /swiftshader|llvmpipe|software/i.test(rendererString);

    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(container.clientWidth || 640, container.clientHeight || 420);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const maxAniso = isSoftwareGl
      ? 1
      : Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EEF5F5');
    scene.fog = new THREE.FogExp2('#EEF5F5', 0.032);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.65;
    roomEnv.dispose();

    const camera = new THREE.PerspectiveCamera(
      40,
      (container.clientWidth || 640) / (container.clientHeight || 420),
      0.1,
      50
    );
    camera.position.set(0.35, 1.85, 4.35);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 7.2;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.35, 0);

    // Warm key + Cool Hemisphere studio lighting
    const hemiLight = new THREE.HemisphereLight('#DFF1F3', '#C9BFA9', 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF5E8', 2.05);
    keyLight.position.set(3.4, 5.2, 3.6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(isSoftwareGl ? 512 : 1024, isSoftwareGl ? 512 : 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -3.2;
    keyLight.shadow.camera.right = 3.2;
    keyLight.shadow.camera.top = 3.2;
    keyLight.shadow.camera.bottom = -3.2;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#CFE7EA', 0.85);
    rimLight.position.set(-3.2, 2.4, -3.0);
    scene.add(rimLight);

    // Matte turntable studio plinth & radial contact shadow
    const floorGeo = new THREE.CircleGeometry(14, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#E6F0F0',
      roughness: 0.94,
      metalness: 0.0,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.58;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const plinthGeo = new THREE.CylinderGeometry(1.55, 1.62, 0.14, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.78,
      metalness: 0.04,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.51;
    plinthMesh.receiveShadow = true;
    scene.add(plinthMesh);

    const plinthRingGeo = new THREE.TorusGeometry(1.56, 0.014, 12, 64);
    const plinthRingMat = new THREE.MeshStandardMaterial({
      color: '#1F6E72',
      roughness: 0.34,
      metalness: 0.45,
    });
    const plinthRing = new THREE.Mesh(plinthRingGeo, plinthRingMat);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = -0.44;
    scene.add(plinthRing);

    const contactShadowTex = createContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(2.5, 2.5);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.435;
    scene.add(shadowPlane);

    // Composite hero product group
    const productRoot = new THREE.Group();
    scene.add(productRoot);

    const dynamicDisposables: Array<{ dispose: () => void }> = [];

    const clearDynamicModel = () => {
      while (productRoot.children.length > 0) {
        productRoot.remove(productRoot.children[0]);
      }
      while (dynamicDisposables.length > 0) {
        dynamicDisposables.pop()?.dispose();
      }
    };

    const buildModelGroup = () => {
      clearDynamicModel();
      const { model, filament, text } = activeConfigRef.current;

      const metalMat = new THREE.MeshStandardMaterial({
        color: '#CBD5E1',
        metalness: 0.88,
        roughness: 0.22,
      });
      const brassMat = new THREE.MeshStandardMaterial({
        color: '#D4A548',
        metalness: 0.82,
        roughness: 0.26,
      });
      const bodyMat = new THREE.MeshStandardMaterial({
        color: filament.hex,
        roughness: 0.7,
        metalness: 0.04,
      });
      const trimMat = new THREE.MeshStandardMaterial({
        color: filament.id === 'charcoal' ? '#111827' : '#0F172A',
        roughness: 0.56,
        metalness: 0.08,
      });
      dynamicDisposables.push(metalMat, brassMat, bodyMat, trimMat);

      const registerPart = (
        obj: THREE.Object3D,
        basePos: [number, number, number],
        explodeOffset: [number, number, number]
      ) => {
        obj.position.set(...basePos);
        obj.userData.basePos = new THREE.Vector3(...basePos);
        obj.userData.explodeOffset = new THREE.Vector3(...explodeOffset);
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = !isSoftwareGl;
            child.receiveShadow = true;
          }
        });
        productRoot.add(obj);
      };

      if (model === 'plate') {
        productRoot.position.set(0, 0.36, 0);

        // 1. Beveled rounded backplate
        const plateShape = createRoundedRectShape(2.1, 0.78, 0.11);
        const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
          depth: 0.14,
          bevelEnabled: true,
          bevelThickness: 0.025,
          bevelSize: 0.025,
          bevelSegments: 3,
        });
        plateGeo.center();
        const plateMesh = new THREE.Mesh(plateGeo, bodyMat);
        registerPart(plateMesh, [0, 0, 0], [0, 0, -0.25]);
        dynamicDisposables.push(plateGeo);

        // 2. Contrasting raised outer frame border
        const borderOuter = createRoundedRectShape(2.14, 0.82, 0.12);
        const borderHole = createRoundedRectShape(1.94, 0.62, 0.07);
        borderOuter.holes.push(borderHole);
        const borderGeo = new THREE.ExtrudeGeometry(borderOuter, {
          depth: 0.06,
          bevelEnabled: true,
          bevelThickness: 0.015,
          bevelSize: 0.015,
          bevelSegments: 2,
        });
        borderGeo.center();
        const borderMesh = new THREE.Mesh(borderGeo, trimMat);
        registerPart(borderMesh, [0, 0, 0.09], [0, 0, 0.2]);
        dynamicDisposables.push(borderGeo);

        // 3. Textured faceplate with live IND badge & registration text
        const faceTex = createPlateCanvasTexture(
          text,
          filament.hex,
          filament.accentHex,
          maxAniso
        );
        const faceMat = new THREE.MeshStandardMaterial({
          map: faceTex,
          roughness: 0.42,
          metalness: 0.06,
        });
        const faceGeo = new THREE.PlaneGeometry(1.92, 0.62);
        const faceMesh = new THREE.Mesh(faceGeo, faceMat);
        registerPart(faceMesh, [0, 0, 0.098], [0, 0, 0.45]);
        dynamicDisposables.push(faceTex, faceMat, faceGeo);

        // 4. Left eyelet grommet collar
        const grommetGeo = new THREE.TorusGeometry(0.085, 0.024, 14, 32);
        const grommetMesh = new THREE.Mesh(grommetGeo, brassMat);
        registerPart(grommetMesh, [-1.12, 0, 0], [-0.3, 0.15, 0]);
        dynamicDisposables.push(grommetGeo);

        // 5. Chain connector link
        const linkGeo = new THREE.TorusGeometry(0.11, 0.022, 12, 28);
        const linkMesh = new THREE.Mesh(linkGeo, metalMat);
        linkMesh.rotation.y = Math.PI / 2;
        registerPart(linkMesh, [-1.29, 0, 0], [-0.55, 0.25, 0]);
        dynamicDisposables.push(linkGeo);

        // 6. Brushed stainless steel split keyring
        const ringGeo = new THREE.TorusGeometry(0.32, 0.032, 18, 48);
        const ringMesh = new THREE.Mesh(ringGeo, metalMat);
        registerPart(ringMesh, [-1.62, 0, 0], [-0.85, 0.35, 0]);
        dynamicDisposables.push(ringGeo);
      } else if (model === 'gym') {
        productRoot.position.set(0, 0.42, 0);

        // 1. Turned Olympic disc profile (LatheGeometry)
        const profile = [
          new THREE.Vector2(0.18, -0.14),
          new THREE.Vector2(0.45, -0.14),
          new THREE.Vector2(0.48, -0.09),
          new THREE.Vector2(0.76, -0.09),
          new THREE.Vector2(0.84, -0.15),
          new THREE.Vector2(0.96, -0.15),
          new THREE.Vector2(1.02, -0.08),
          new THREE.Vector2(1.02, 0.08),
          new THREE.Vector2(0.96, 0.15),
          new THREE.Vector2(0.84, 0.15),
          new THREE.Vector2(0.76, 0.09),
          new THREE.Vector2(0.48, 0.09),
          new THREE.Vector2(0.45, 0.14),
          new THREE.Vector2(0.18, 0.14),
        ];
        const discGeo = new THREE.LatheGeometry(profile, 48);
        discGeo.rotateX(Math.PI / 2);
        const discMesh = new THREE.Mesh(discGeo, bodyMat);
        registerPart(discMesh, [0, 0, 0], [0, 0, -0.25]);
        dynamicDisposables.push(discGeo);

        // 2. Printed weight faceplate overlay
        const gymTex = createGymPlateTexture(
          text,
          filament.hex,
          filament.accentHex,
          maxAniso
        );
        const gymFaceMat = new THREE.MeshStandardMaterial({
          map: gymTex,
          roughness: 0.46,
          metalness: 0.06,
        });
        const gymFaceGeo = new THREE.RingGeometry(0.24, 0.82, 48);
        const gymFaceFront = new THREE.Mesh(gymFaceGeo, gymFaceMat);
        registerPart(gymFaceFront, [0, 0, 0.098], [0, 0, 0.3]);
        dynamicDisposables.push(gymTex, gymFaceMat, gymFaceGeo);

        // 3. Machined center steel sleeve bushing
        const sleeveGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 32, 1, true);
        sleeveGeo.rotateX(Math.PI / 2);
        const sleeveMesh = new THREE.Mesh(sleeveGeo, metalMat);
        registerPart(sleeveMesh, [0, 0, 0], [0, 0, 0.55]);
        dynamicDisposables.push(sleeveGeo);

        // 4. Outer contrast grip ribs (group)
        const ribsGroup = new THREE.Group();
        const ribGeo = new THREE.BoxGeometry(0.11, 0.24, 0.32);
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const rib = new THREE.Mesh(ribGeo, trimMat);
          rib.position.set(Math.cos(ang) * 0.98, Math.sin(ang) * 0.98, 0);
          rib.rotation.z = ang + Math.PI / 2;
          ribsGroup.add(rib);
        }
        registerPart(ribsGroup, [0, 0, 0], [0, -0.22, -0.05]);
        dynamicDisposables.push(ribGeo);

        // 5. Keyring top collar lug + steel split ring
        const lugGeo = new THREE.TorusGeometry(0.1, 0.025, 14, 28);
        const lugMesh = new THREE.Mesh(lugGeo, brassMat);
        registerPart(lugMesh, [0, 1.07, 0], [0, 0.35, 0]);
        dynamicDisposables.push(lugGeo);

        const ringGeo = new THREE.TorusGeometry(0.28, 0.03, 18, 48);
        const ringMesh = new THREE.Mesh(ringGeo, metalMat);
        registerPart(ringMesh, [0, 1.38, 0], [0, 0.65, 0]);
        dynamicDisposables.push(ringGeo);
      } else {
        // Krishna / Mandala Architectural Shadow Lamp
        productRoot.position.set(0, 0.2, 0);

        // 1. Turned wooden oak base
        const woodTex = createWoodGrainTexture(maxAniso);
        const woodMat = new THREE.MeshStandardMaterial({
          map: woodTex,
          roughness: 0.84,
          metalness: 0.0,
        });
        const basePoints = [
          new THREE.Vector2(0.01, -0.64),
          new THREE.Vector2(0.84, -0.64),
          new THREE.Vector2(0.86, -0.52),
          new THREE.Vector2(0.76, -0.42),
          new THREE.Vector2(0.01, -0.42),
        ];
        const baseGeo = new THREE.LatheGeometry(basePoints, 48);
        const baseMesh = new THREE.Mesh(baseGeo, woodMat);
        registerPart(baseMesh, [0, 0, 0], [0, -0.42, 0]);
        dynamicDisposables.push(woodTex, woodMat, baseGeo);

        // 2. Lower & upper brass trim rings
        const ringGeo = new THREE.TorusGeometry(0.68, 0.032, 16, 48);
        const lowerBrass = new THREE.Mesh(ringGeo, brassMat);
        lowerBrass.rotation.x = Math.PI / 2;
        registerPart(lowerBrass, [0, -0.4, 0], [0, -0.22, 0]);

        const upperBrass = new THREE.Mesh(ringGeo, brassMat);
        upperBrass.rotation.x = Math.PI / 2;
        registerPart(upperBrass, [0, 0.92, 0], [0, 0.45, 0]);
        dynamicDisposables.push(ringGeo);

        // 3. Fluted patterned translucent shadow shade
        const shadeTex = createMandalaPatternTexture(filament.hex, maxAniso);
        const shadeMat = new THREE.MeshStandardMaterial({
          map: shadeTex,
          emissive: new THREE.Color('#D97706'),
          emissiveMap: shadeTex,
          emissiveIntensity: 0.34,
          roughness: 0.58,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });
        const shadeGeo = new THREE.CylinderGeometry(0.66, 0.66, 1.3, 48, 1, true);
        const shadeMesh = new THREE.Mesh(shadeGeo, shadeMat);
        registerPart(shadeMesh, [0, 0.26, 0], [0, 0.14, 0]);
        dynamicDisposables.push(shadeTex, shadeMat, shadeGeo);

        // 4. Vertical architectural ribs around cylinder
        const ribsGroup = new THREE.Group();
        const pillarGeo = new THREE.BoxGeometry(0.045, 1.32, 0.045);
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          const pillar = new THREE.Mesh(pillarGeo, trimMat);
          pillar.position.set(Math.cos(ang) * 0.68, 0.26, Math.sin(ang) * 0.68);
          pillar.rotation.y = -ang;
          ribsGroup.add(pillar);
        }
        registerPart(ribsGroup, [0, 0, 0], [0, 0.28, 0]);
        dynamicDisposables.push(pillarGeo);

        // 5. Warm glowing inner LED core + point light
        const bulbGroup = new THREE.Group();
        const bulbMat = new THREE.MeshStandardMaterial({
          color: '#FFF3C4',
          emissive: '#FFB347',
          emissiveIntensity: 1.5,
          roughness: 0.25,
        });
        const bulbGeo = new THREE.SphereGeometry(0.18, 24, 24);
        const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
        const innerLight = new THREE.PointLight('#FFB347', 1.5, 4.5);
        bulbGroup.add(bulbMesh);
        bulbGroup.add(innerLight);
        registerPart(bulbGroup, [0, 0.15, 0], [0, 0.02, 0]);
        dynamicDisposables.push(bulbMat, bulbGeo);

        // 6. Top finial lid cap
        const capPoints = [
          new THREE.Vector2(0.0, 1.06),
          new THREE.Vector2(0.14, 1.02),
          new THREE.Vector2(0.32, 0.97),
          new THREE.Vector2(0.69, 0.95),
          new THREE.Vector2(0.69, 0.92),
          new THREE.Vector2(0.0, 0.92),
        ];
        const capGeo = new THREE.LatheGeometry(capPoints, 48);
        const capMesh = new THREE.Mesh(capGeo, bodyMat);
        registerPart(capMesh, [0, 0, 0], [0, 0.62, 0]);
        dynamicDisposables.push(capGeo);
      }
    };

    buildModelGroup();
    rebuildModelRef.current = () => {
      buildModelGroup();
      requestRenderRef.current();
    };

    // Scratch vectors allocated once outside animation loop
    const scratchTargetPos = new THREE.Vector3();
    const defaultCamPos = new THREE.Vector3(0.35, 1.85, 4.35);
    const defaultTarget = new THREE.Vector3(0, 0.35, 0);

    let rafId = 0;
    let isDisposed = false;
    let isInView = true;
    let needsRender = true;
    let prevTime = performance.now();
    let lastHandledReset = resetTriggerRef.current;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafId);
    };
    const handleContextRestored = () => {
      needsRender = true;
      scheduleLoop();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    controls.addEventListener('change', () => {
      needsRender = true;
    });

    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      needsRender = true;
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isInView = entries[0]?.isIntersecting ?? true;
        if (isInView) {
          prevTime = performance.now();
          needsRender = true;
          scheduleLoop();
        }
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(container);

    const onDocVisibility = () => {
      if (!document.hidden && isInView) {
        prevTime = performance.now();
        needsRender = true;
        scheduleLoop();
      }
    };
    document.addEventListener('visibilitychange', onDocVisibility);

    requestRenderRef.current = () => {
      needsRender = true;
      scheduleLoop();
    };

    const animate = (now: number) => {
      if (isDisposed) return;
      rafId = 0;

      if (!isInView || document.hidden) return;

      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      let keepAnimating = false;

      if (resetTriggerRef.current !== lastHandledReset) {
        lastHandledReset = resetTriggerRef.current;
        camera.position.copy(defaultCamPos);
        controls.target.copy(defaultTarget);
        productRoot.rotation.set(0, 0, 0);
        needsRender = true;
      }

      if (autoRotateRef.current) {
        productRoot.rotation.y += dt * 0.48;
        keepAnimating = true;
      }

      // Exponential damping for exploded view separation
      const targetExplode = explodedRef.current ? 1 : 0;
      for (const child of productRoot.children) {
        const base = child.userData.basePos as THREE.Vector3 | undefined;
        const offset = child.userData.explodeOffset as THREE.Vector3 | undefined;
        if (!base || !offset) continue;
        scratchTargetPos.copy(base).addScaledVector(offset, targetExplode);
        const distSq = child.position.distanceToSquared(scratchTargetPos);
        if (distSq > 1e-6) {
          child.position.x = THREE.MathUtils.damp(child.position.x, scratchTargetPos.x, 8, dt);
          child.position.y = THREE.MathUtils.damp(child.position.y, scratchTargetPos.y, 8, dt);
          child.position.z = THREE.MathUtils.damp(child.position.z, scratchTargetPos.z, 8, dt);
          keepAnimating = true;
        }
      }

      const controlsChanged = controls.update();
      if (controlsChanged) keepAnimating = true;

      if (needsRender || keepAnimating) {
        renderer.render(scene, camera);
        needsRender = false;
      }

      if (keepAnimating) {
        scheduleLoop();
      }
    };

    function scheduleLoop() {
      if (!rafId && !isDisposed && isInView && !document.hidden) {
        rafId = requestAnimationFrame(animate);
      }
    }

    scheduleLoop();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', onDocVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      clearDynamicModel();
      floorGeo.dispose();
      floorMat.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      plinthRingGeo.dispose();
      plinthRingMat.dispose();
      contactShadowTex.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();
      envTarget.dispose();
      pmrem.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      id="studio-3d"
      aria-labelledby="studio-3d-heading"
      className="bg-white border-t border-[#E5E7EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6E72] mb-1.5">
              <Box className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interactive WebGL Studio</span>
            </div>
            <h2
              id="studio-3d-heading"
              className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]"
            >
              Inspect Prints in Real-Time 3D
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#64748B]">
              Drag to orbit, zoom in on bevel layers, test filament colors, and preview your custom engraving before ordering.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(MODEL_META) as StudioModelId[]).map((id) => (
              <Button
                key={id}
                variant={selectedModel === id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectModel(id)}
              >
                {MODEL_META[id].label}
              </Button>
            ))}
          </div>
        </div>

        {/* 3D Viewport Container */}
        <div
          className={`relative rounded-[16px] border border-[#E5E7EB] overflow-hidden bg-[#EEF5F5] transition-all duration-300 ${
            isExpanded ? 'h-[580px] sm:h-[640px]' : 'h-[430px] sm:h-[490px]'
          }`}
        >
          {webglError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <Box className="w-10 h-10 text-[#1F6E72] mb-3" aria-hidden="true" />
              <p className="font-heading font-semibold text-[#111827]">
                {webglError}
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                Use the interactive customizer modal to preview any product.
              </p>
            </div>
          ) : (
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              aria-label={`Interactive 3D preview of ${meta.label}`}
            />
          )}

          {/* Minimal Top-Left Spec Pill + Top-Right Camera Utility */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 pointer-events-none">
            <Badge className="bg-white text-[#111827] border border-[#E5E7EB] shadow-xs font-mono">
              {meta.dimensions} · {meta.material}
            </Badge>
          </div>

          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setResetSignal((n) => n + 1)}
              aria-label="Reset 3D camera"
              title="Reset camera"
              className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] text-[#111827] hover:text-[#1F6E72] flex items-center justify-center shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              aria-label={isExpanded ? 'Compact 3D view' : 'Expand 3D view'}
              title={isExpanded ? 'Compact height' : 'Expand viewport'}
              className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] text-[#111827] hover:text-[#1F6E72] flex items-center justify-center shadow-xs cursor-pointer"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Collapsible Bottom Control Dock (solid opaque backing, <=15% height, no backdrop-filter) */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="mx-auto max-w-4xl rounded-[12px] bg-[#FFFFFF]/96 border border-[#E5E7EB] shadow-sm px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1F6E72]" aria-hidden="true" />
                  <span>{meta.label} Studio Controls</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDockCollapsed((c) => !c)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#111827] px-2 py-1 rounded cursor-pointer"
                >
                  <span>{dockCollapsed ? 'Show Controls' : 'Hide'}</span>
                  {dockCollapsed ? (
                    <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>

              {!dockCollapsed && (
                <div className="mt-2.5 pt-2.5 border-t border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Live Engraving Text */}
                  <div className="flex items-center gap-2 min-w-0">
                    <label
                      htmlFor="studio-3d-text"
                      className="text-xs font-medium text-[#64748B] whitespace-nowrap"
                    >
                      Text:
                    </label>
                    <Input
                      id="studio-3d-text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      maxLength={18}
                      placeholder={meta.placeholder}
                      className="h-9 w-44 sm:w-48 font-mono text-xs uppercase bg-[#F8FAFC]"
                    />
                  </div>

                  {/* Filament Swatches */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#64748B] whitespace-nowrap">
                      Filament:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {STUDIO_FILAMENTS.map((f) => {
                        const active = f.id === selectedFilament.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setSelectedFilament(f)}
                            aria-label={`Select ${f.name} filament`}
                            title={f.name}
                            className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                              active
                                ? 'ring-2 ring-[#1F6E72] ring-offset-1 scale-105 border-[#111827]'
                                : 'border-[#CBD5E1] hover:scale-105'
                            }`}
                            style={{ backgroundColor: f.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Toggles & Order CTA */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={exploded ? 'default' : 'outline'}
                      size="sm"
                      className="h-9"
                      onClick={() => setExploded((v) => !v)}
                    >
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{exploded ? 'Assemble' : 'Explode'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => setAutoRotate((v) => !v)}
                    >
                      {autoRotate ? (
                        <>
                          <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Pause Spin</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Spin</span>
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="h-9"
                      onClick={() => onCustomizeProductId(meta.productId)}
                    >
                      Order This Model
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
