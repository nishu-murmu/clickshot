import { invoke } from '@tauri-apps/api/core';
import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Transformer, Rect } from 'react-konva';

const App = () => {
  const [sel, setSel] = useState({ visible: false, x1: 0, y1: 0, x2: 0, y2: 0 });
  const isDrawing = useRef(false);
  const trRef = useRef<any>(null);
  const rectRef = useRef<any>(null);
  const holePunchRef = useRef<any>(null);

  const x = Math.min(sel.x1, sel.x2);
  const y = Math.min(sel.y1, sel.y2);
  const w = Math.abs(sel.x2 - sel.x1);
  const h = Math.abs(sel.y2 - sel.y1);

  // keeps hole punch in sync when dragging or resizing
  const syncHolePunch = () => {
    if (!rectRef.current || !holePunchRef.current) return;
    const n = rectRef.current;
    holePunchRef.current.setAttrs({
      x: n.x(),
      y: n.y(),
      width: n.width() * n.scaleX(),
      height: n.height() * n.scaleY(),
    });
    holePunchRef.current.getLayer().batchDraw();
  };

  const handleMouseDown = (e: any) => {
    if (e.target !== e.target.getStage()) return; // ignore clicks on rect/transformer
    trRef.current?.nodes([]);
    const p = e.target.getStage().getPointerPosition();
    isDrawing.current = true;
    setSel({ visible: true, x1: p.x, y1: p.y, x2: p.x, y2: p.y });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const p = e.target.getStage().getPointerPosition();
    setSel(prev => ({ ...prev, x2: p.x, y2: p.y }));
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    trRef.current?.nodes([rectRef.current]); // attach transformer after drawing
  };

  const handleStageClick = (e: any) => {
    if (isDrawing.current) return;
    if (e.target === e.target.getStage()) {
      setSel(prev => ({ ...prev, visible: false }));
      trRef.current?.nodes([]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") invoke("close_overlay_command");
      if (e.key === "Enter" && Object.keys(holePunchRef.current.attrs)) {
        const { x, y, width, height } = holePunchRef.current.attrs;
        invoke("region_screenshot_command", { x, y, width, height });
      }
    };

    const handleFocus = () => {
      setSel({ visible: false, x1: 0, y1: 0, x2: 0, y2: 0 });
      trRef.current?.nodes([]);
      isDrawing.current = false;
    };

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("focus", handleFocus);
    }
  }, [])

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleStageClick}
    >
      {/* Layer 1 — dim + hole punch */}
      <Layer>
        <Rect
          x={0} y={0}
          width={window.innerWidth}
          height={window.innerHeight}
          fill="rgba(0,0,0,0.5)"
          listening={false}
        />
        <Rect
          ref={holePunchRef}
          x={x} y={y} width={w} height={h}
          fill="black"
          globalCompositeOperation="destination-out"
          visible={sel.visible}
          listening={false}
        />
      </Layer>

      {/* Layer 2 — draggable selection border + transformer */}
      <Layer>
        <Rect
          ref={rectRef}
          x={x} y={y} width={w} height={h}
          fill="transparent"
          stroke="#87CEEB"
          strokeWidth={2}
          draggable
          visible={sel.visible}
          onDragMove={syncHolePunch}
          onTransform={syncHolePunch}
          onTransformEnd={() => {
            // normalize scale back to 1 after resize
            const node = rectRef.current;
            node.setAttrs({
              width: node.width() * node.scaleX(),
              height: node.height() * node.scaleY(),
              scaleX: 1,
              scaleY: 1,
            });
            syncHolePunch();
          }}
        />
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          anchorCornerRadius={50}
          anchorFill="white"
          anchorStroke="#1D9E75"
          borderStroke="#1D9E75"
          keepRatio={false}
        />
      </Layer>
    </Stage>
  );
};

export default App;
