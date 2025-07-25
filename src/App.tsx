import { JSX, useEffect, useRef } from "react";
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  MeshBasicMaterial,
  Mesh,
  ACESFilmicToneMapping,
  SRGBColorSpace,
  TubeGeometry,
  DoubleSide,
  HemisphereLight,
  FogExp2,
  Color,
  EdgesGeometry,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  BoxGeometry,
  Vector3,
  Vector2,
} from "three";
import {
  EffectComposer,
  OrbitControls,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import spline from "./3dComponents/spline";

const w: number = window.innerWidth;
const h: number = window.innerHeight;

function App(): JSX.Element {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null); // Ref to store the renderer

  useEffect(() => {
    const currentRef = sceneRef.current; // Capture the current ref

    if (!currentRef) return; // Exit if the ref is not yet attached

    // Check if a canvas already exists
    if (currentRef.firstChild) {
      // Clean up previous instance (optional, but good practice)
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      currentRef.removeChild(currentRef.firstChild); // Remove the existing canvas
    }

    // Set up Renderer
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    rendererRef.current = renderer; // Store the renderer in the ref
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.outputColorSpace = SRGBColorSpace;
    currentRef.appendChild(renderer.domElement);

    // Set up Camera
    const camera = new PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5; // Position the camera

    // Create Scene
    const scene = new Scene();
    scene.background = new Color(0x000011);
    scene.fog = new FogExp2(0x000011, 0.3);

    // Set up Controls (optional - remove if not needed)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    // post-processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new Vector2(w, h), 1.5, 0.4, 100);
    bloomPass.threshold = 0.002;
    bloomPass.strength = 3;
    bloomPass.radius = 0;
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // // MAIN TUNNEL CODE // //
    // create a line geometry from the spline
    const points = spline.getPoints(100);
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0xff0000 });
    const _line = new Line(geometry, material);

    // create a tube geometry from the spline using TubeGeomtry
    const tubeGeometry = new TubeGeometry(spline, 222, 0.66, 16, true);

    // create edges for the tube look
    const edges = new EdgesGeometry(tubeGeometry, 0.2);
    const lineMat = new LineBasicMaterial({ color: 0x8888ff }); // grayish blue
    const tubeLines = new LineSegments(edges, lineMat);
    scene.add(tubeLines);

    //  for creating the the entire tube using mesh
    // const tubeMaterial = new MeshBasicMaterial({
    //   color: 0xffffff,
    //   wireframe: true,
    //   side: DoubleSide,
    // });
    // const tube = new Mesh(tubeGeometry, tubeMaterial);
    // scene.add(tube);

    // Add boxes in the tunnel with slight random offset from the middle of the tunnel
    const numBoxes = 55;
    const size = 0.075;
    const boxGeo = new BoxGeometry(size, size, size);
    for (let i = 0; i < numBoxes; i += 1) {
      const boxMat = new MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });
      const box = new Mesh(boxGeo, boxMat);
      const p = (i / numBoxes + Math.random() * 0.1) % 1;
      const pos = tubeGeometry.parameters.path.getPointAt(p);
      pos.x += Math.random() - 0.4;
      pos.z += Math.random() - 0.4;
      box.position.copy(pos);
      const rote = new Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      box.rotation.set(rote.x, rote.y, rote.z);
      const edges = new EdgesGeometry(boxGeo, 0.2);
      const color = new Color().setHSL(0.7 - p, 1, 0.5);
      const lineMat = new LineBasicMaterial({ color });
      const boxLines = new LineSegments(edges, lineMat);
      boxLines.position.copy(pos);
      boxLines.rotation.set(rote.x, rote.y, rote.z);
      scene.add(boxLines);
    }

    // Add Hemisphere Light
    const hemilight = new HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemilight);

    // Fly through the tunnel
    function updateCamera(t: number): void {
      const time = t * 0.12;
      const loopTime = 10 * 1000; // Duration of one loop in seconds
      const p = (time % loopTime) / loopTime; // Normalize t to [0, 1]
      const pos = tubeGeometry.parameters.path.getPointAt(p);
      const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.01) % 1); // Look ahead slightly
      camera.position.copy(pos);
      camera.lookAt(lookAt);
    }

    // Animation loop
    function animate(t: number = 0): void {
      requestAnimationFrame(animate);
      updateCamera(t);
      composer.render();
      controls.update();
    }

    animate();

    return () => {
      if (currentRef && currentRef.firstChild) {
        currentRef.removeChild(currentRef.firstChild);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div className="threejs-canvas" ref={sceneRef} />;
}

export default App;
