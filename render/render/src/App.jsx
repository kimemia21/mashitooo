import React, { useState, useRef } from "react";
import { Menu, X, RotateCcw, Home, PanelsTopLeft } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Center } from "@react-three/drei";
import Model from "./components/Model";
import ModernBackground from "./components/ModernBackground";
import ColorPicker from "./components/ColorPicker";
import StickerPicker from "./components/StickerPicker";
import EditModeUI from "./components/EditModeUI";
import StickerEditor from "./components/StickerEditor";
import {
  preprocessStickers,
  createStickerPreview,
  debugCoordinateMapping,
  verifyCoordinateSystem,
} from "./utils/stickerMapping";
import Panel from "./components/Panel";
import IconButton from "./components/IconButton";

function App() {
  const [appMode, setAppMode] = useState("VIEW"); // 'VIEW', 'EDIT'
  const [editSide, setEditSide] = useState(null);
  const [tshirtColor, setTshirtColor] = useState("#ffffff");
  const [stickers, setStickers] = useState([]);
  const [stickerLibrary, setStickerLibrary] = useState([
    { url: "/sample-sticker.svg", name: "Sample Sticker" },
    { url: "/test-sticker.svg", name: "Test Sticker" },
  ]);
  const [editorStickers, setEditorStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const controlsRef = useRef();

  // --- Core Handlers ---
  const handleEditMode = () => setAppMode("EDIT");

  const handleSideSelect = (side) => {
    setEditSide(side);
    const sideStickers = stickers.filter((s) => s.side === side);
    setEditorStickers(
      sideStickers.map((s) => ({
        ...s,
        x: s.editorX || 50,
        y: s.editorY || 50,
        width: s.editorWidth || 100,
        height: s.editorHeight || 100,
        rotation: s.editorRotation || 0,
      }))
    );
  };

  const handleAddSticker = (sticker) => {
    const newSticker = {
      id: Date.now(),
      url: sticker.url,
      name: sticker.name,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      side: editSide,
    };
    setEditorStickers([...editorStickers, newSticker]);
  };

  const handleStickerUpload = (dataUrl, fileName) => {
    const newSticker = { url: dataUrl, name: fileName };
    setStickerLibrary([...stickerLibrary, newSticker]);
  };

  const handleStickerUpdate = (stickerId, updates) => {
    setEditorStickers(
      editorStickers.map((s) =>
        s.id === stickerId ? { ...s, ...updates } : s
      )
    );
  };

  const handleStickerDelete = (stickerId) => {
    setEditorStickers(editorStickers.filter((s) => s.id !== stickerId));
    if (selectedSticker === stickerId) setSelectedSticker(null);
  };

  const handleApplyChanges = async () => {
    setIsApplying(true);
    try {
      verifyCoordinateSystem(editorStickers);
      const otherSideStickers = stickers.filter((s) => s.side !== editSide);
      const processedStickers = await preprocessStickers(editorStickers, editSide);

      const finalStickers = processedStickers.map((sticker, i) => ({
        ...sticker,
        side: editSide,
        editorX: editorStickers[i].x,
        editorY: editorStickers[i].y,
        editorWidth: editorStickers[i].width,
        editorHeight: editorStickers[i].height,
        editorRotation: editorStickers[i].rotation,
      }));

      setStickers([...otherSideStickers, ...finalStickers]);
    } catch (error) {
      console.error("Error applying stickers:", error);
      alert("Failed to apply design. Check console.");
    } finally {
      setIsApplying(false);
      setAppMode("VIEW");
      setEditSide(null);
      setEditorStickers([]);
      setSelectedSticker(null);
    }
  };

  const handleCancelEdit = () => {
    setAppMode("VIEW");
    setEditSide(null);
    setEditorStickers([]);
    setSelectedSticker(null);
  };

  const handleResetView = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  // --- Layout ---
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#0b0c10] via-[#121317] to-[#1c1f24] text-gray-200 overflow-hidden">
      {appMode === "VIEW" && (
        <>
          {/* Sidebar Toggle Button (Desktop + Tablet) */}
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="absolute top-5 left-5 z-50 p-2 bg-gray-800/70 backdrop-blur-md rounded-lg hover:bg-gray-700/80 transition-all"
          >
            {sidebarVisible ? <X size={20} /> : <PanelsTopLeft size={20} />}
          </button>

          {/* Left Sidebar */}
          {sidebarVisible && (
            <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/70 backdrop-blur-md border-r border-gray-800 shadow-xl flex flex-col p-4 z-40 transition-transform">
              <h2 className="text-lg font-semibold mb-4 text-gray-100">
                🎨 Color & Stickers
              </h2>

              <Panel title="Colors" defaultOpen>
                <ColorPicker color={tshirtColor} onChange={setTshirtColor} />
              </Panel>

              <div className="mt-6">
                <Panel title="Stickers" defaultOpen>
                  <StickerPicker
                    onStickerSelect={handleAddSticker}
                    stickers={stickerLibrary}
                    onStickerUpload={handleStickerUpload}
                  />
                </Panel>
              </div>
            </div>
          )}

          {/* 3D Canvas */}
          <div
            className={`transition-all duration-300 ${
              sidebarVisible ? "ml-64" : "ml-0"
            } w-full h-full`}
          >
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              className="w-full h-full"
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
              }}
              dpr={Math.min(window.devicePixelRatio, 2)}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1.1} />
              <Environment preset="studio" />
              <ModernBackground />

              <OrbitControls
                ref={controlsRef}
                enablePan
                enableZoom
                enableRotate
                dampingFactor={0.05}
              />

              <Center>
                <Model
                  color={tshirtColor}
                  stickers={stickers}
                  viewMode="rendered"
                />
              </Center>
            </Canvas>
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
            <IconButton
              icon={Home}
              onClick={handleResetView}
              tooltip="Reset View"
              size={20}
            />
            <IconButton
              icon={RotateCcw}
              onClick={() => {
                if (controlsRef.current) {
                  controlsRef.current.autoRotate =
                    !controlsRef.current.autoRotate;
                }
              }}
              tooltip="Auto Rotate"
              size={20}
            />
          </div>

          {/* Main Action Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={handleEditMode}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold px-8 py-4 rounded-full shadow-lg shadow-green-500/50 hover:scale-105 transition-all duration-300"
            >
              ✨ Edit Design
            </button>
          </div>
        </>
      )}

      {/* Edit Mode */}
      {appMode === "EDIT" && !editSide && (
        <EditModeUI
          onSideSelect={handleSideSelect}
          onCancel={handleCancelEdit}
        />
      )}

      {appMode === "EDIT" && editSide && (
        <StickerEditor
          side={editSide}
          stickers={editorStickers}
          stickerLibrary={stickerLibrary}
          selectedSticker={selectedSticker}
          onStickerSelect={setSelectedSticker}
          onStickerAdd={handleAddSticker}
          onStickerUpdate={handleStickerUpdate}
          onStickerDelete={handleStickerDelete}
          onStickerUpload={handleStickerUpload}
          onApply={handleApplyChanges}
          onCancel={handleCancelEdit}
          isApplying={isApplying}
        />
      )}

      {/* Applying Overlay */}
      {isApplying && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999]">
          <div className="p-6 rounded-xl bg-gray-900/80 border border-gray-700 shadow-2xl text-center">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-300 font-medium">
              Applying your design...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
