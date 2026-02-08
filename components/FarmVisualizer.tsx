
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Eye } from 'lucide-react';

interface FarmVisualizerProps {
  stageId: string;
}

// --- CONSTANTS ---
const TILE_SIZE = 50; 
const GRID_SIZE = 6;

// --- TYPES ---
interface GameObject {
  id: string;
  x: number;
  y: number;
  type: 'ground' | 'water' | 'road' | 'obstacle' | 'building' | 'decoration' | 'vehicle';
  variant?: string;
  level?: number;
}

// --- 3D COMPONENTS ---

// A generic 3D Box (Voxel)
const Voxel = ({ 
  width = TILE_SIZE, 
  depth = TILE_SIZE, 
  height = 10, 
  x = 0, 
  y = 0, 
  z = 0,
  color = '#86efac', 
  sideColor,
  topColor,
  className = "",
  children = null
}: any) => {
  
  const finalSideColor = sideColor || adjustColor(color, -20);
  const finalTopColor = topColor || color;

  return (
    <div 
      className={`absolute transition-all duration-500 preserve-3d ${className}`}
      style={{
        width: `${width}px`,
        height: `${depth}px`,
        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Top Face */}
      <div 
        className="absolute inset-0 transition-colors duration-500 border border-white/10"
        style={{ 
          backgroundColor: finalTopColor, 
          transform: `translateZ(${height}px)` 
        }}
      >
        {children}
      </div>

      {/* South Face (Front-Right in Isometric) */}
      <div 
        className="absolute bottom-0 left-0 w-full transition-colors duration-500"
        style={{ 
          height: `${height}px`, 
          backgroundColor: finalSideColor, 
          transformOrigin: 'bottom', 
          transform: 'rotateX(-90deg)',
          filter: 'brightness(0.9)'
        }}
      />

      {/* East Face (Back-Right in Isometric) */}
      <div 
        className="absolute top-0 right-0 h-full transition-colors duration-500"
        style={{ 
          width: `${height}px`, 
          backgroundColor: finalSideColor, 
          transformOrigin: 'right', 
          transform: 'rotateY(90deg)',
          filter: 'brightness(0.8)'
        }}
      />
    </div>
  );
};

// Helper to darken colors for sides
const adjustColor = (color: string, amount: number) => {
    return color; // Simplified for this demo, usually would use hex manipulation or just rely on filter
}

// --- ASSETS ---

const House3D = () => (
    <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {/* Base */}
        <Voxel width={30} depth={30} height={20} x={10} y={10} z={0} color="#fef3c7" sideColor="#d97706" />
        {/* Roof (Simulated with a smaller box for now or pyramid if complex) - Using a rotated box for peak */}
        <div 
            className="absolute"
            style={{
                width: '34px', height: '34px',
                transform: 'translate3d(8px, 8px, 20px) rotateX(0deg)',
                transformStyle: 'preserve-3d'
            }}
        >
             {/* Simple Roof Box */}
             <Voxel width={34} depth={34} height={8} x={0} y={0} z={0} color="#ef4444" sideColor="#991b1b" />
             {/* Chimney */}
             <Voxel width={6} depth={6} height={10} x={20} y={5} z={8} color="#4b5563" />
        </div>
        {/* Door */}
        <div className="absolute bg-amber-900 w-8 h-12" style={{ transform: 'translate3d(25px, 31px, 0px) rotateX(-90deg)', transformOrigin: 'bottom' }}></div>
    </div>
);

const Barn3D = () => (
    <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        <Voxel width={36} depth={24} height={20} x={7} y={13} z={0} color="#ef4444" sideColor="#991b1b" />
        {/* Roof */}
        <Voxel width={38} depth={26} height={6} x={6} y={12} z={20} color="#7f1d1d" />
        {/* Door */}
        <div className="absolute bg-white w-10 h-10 border-4 border-red-900" style={{ transform: 'translate3d(20px, 38px, 0px) rotateX(-90deg)', transformOrigin: 'bottom' }}></div>
    </div>
);

const Tree3D = ({ variant }: { variant: string }) => (
    <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {/* Trunk */}
        <Voxel width={8} depth={8} height={12} x={21} y={21} z={0} color="#78350f" />
        {/* Leaves */}
        {variant === 'pine' ? (
             <>
               <Voxel width={20} depth={20} height={10} x={15} y={15} z={12} color="#166534" />
               <Voxel width={14} depth={14} height={10} x={18} y={18} z={22} color="#15803d" />
               <Voxel width={8} depth={8} height={8} x={21} y={21} z={32} color="#22c55e" />
             </>
        ) : (
             <Voxel width={24} depth={24} height={20} x={13} y={13} z={12} color="#22c55e" sideColor="#15803d" />
        )}
    </div>
);

const Complex3D = () => (
    <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {/* Main Building */}
        <Voxel width={40} depth={40} height={30} x={5} y={5} z={0} color="#f3f4f6" sideColor="#9ca3af" />
        {/* Dome/Tower */}
        <Voxel width={20} depth={20} height={15} x={15} y={15} z={30} color="#f59e0b" sideColor="#d97706" />
        {/* Pillars */}
        <Voxel width={6} depth={6} height={20} x={2} y={2} z={0} color="#e5e7eb" />
        <Voxel width={6} depth={6} height={20} x={42} y={2} z={0} color="#e5e7eb" />
        <Voxel width={6} depth={6} height={20} x={2} y={42} z={0} color="#e5e7eb" />
        <Voxel width={6} depth={6} height={20} x={42} y={42} z={0} color="#e5e7eb" />
    </div>
);

const Billboard = ({ children, x = 0, y = 0, z = 0, scale = 1 }: any) => (
    <div 
       className="absolute flex items-center justify-center pointer-events-none"
       style={{
           width: `${TILE_SIZE}px`,
           height: `${TILE_SIZE}px`,
           transformStyle: 'preserve-3d',
           // Note: The rotation below cancels out the isometric camera to face the screen.
           // Isometric camera is rotateX(60) rotateZ(-45).
           // To face camera: rotateZ(45) rotateX(-60).
           transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(45deg) rotateX(-60deg) translate(0, -50%) scale(${scale})`,
       }}
    >
       {children}
    </div>
);


const FarmVisualizer: React.FC<FarmVisualizerProps> = ({ stageId }) => {
  const [debugStage, setDebugStage] = useState<string | null>(null);
  const activeStageId = debugStage || stageId;
  const stages = ['ruins', 'cleanup', 'shelter', 'house', 'revival', 'complete', 'complex'];
  const stageIndex = stages.indexOf(activeStageId) === -1 ? 0 : stages.indexOf(activeStageId);

  const [objects, setObjects] = useState<GameObject[]>([]);

  useEffect(() => {
    const newObjects: GameObject[] = [];

    // --- MAP GENERATION ---
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        let type = 'ground';
        let variant = 'grass';
        
        // Water
        if (x < 2 && y > 3) type = 'water';
        if (x === 0 && y === 3) type = 'water';
        
        // Road
        if (stageIndex >= 1 && x === 3 && y <= 3) type = 'road';

        // Ruins Mud
        if (stageIndex === 0 && type === 'ground') variant = 'mud';

        newObjects.push({ id: `tile-${x}-${y}`, x, y, type: type as any, variant });
      }
    }

    // --- OBJECTS ---
    // Ruins
    if (stageIndex === 0) {
        newObjects.push({ id: 'r1', x: 2, y: 2, type: 'obstacle', variant: 'rock' });
        newObjects.push({ id: 'r2', x: 4, y: 1, type: 'obstacle', variant: 'stump' });
        newObjects.push({ id: 'r3', x: 1, y: 4, type: 'obstacle', variant: 'rock' });
    }
    // Cleanup
    if (stageIndex >= 1) {
        newObjects.push({ id: 'f1', x: 0, y: 0, type: 'decoration', variant: 'fence' });
        newObjects.push({ id: 'f2', x: 1, y: 0, type: 'decoration', variant: 'fence' });
        newObjects.push({ id: 'f3', x: 2, y: 0, type: 'decoration', variant: 'fence' });
    }
    // Shelter
    if (stageIndex >= 2) {
        newObjects.push({ id: 'barn', x: 4, y: 1, type: 'building', variant: 'barn' });
        newObjects.push({ id: 'cow', x: 4, y: 3, type: 'decoration', variant: 'cow' });
    }
    // House
    if (stageIndex >= 3) {
        newObjects.push({ id: 'house', x: 2, y: 2, type: 'building', variant: 'house' });
    }
    // Revival
    if (stageIndex >= 4) {
        newObjects.push({ id: 't1', x: 0, y: 1, type: 'decoration', variant: 'tree_pine' });
        newObjects.push({ id: 't2', x: 5, y: 5, type: 'decoration', variant: 'tree_pine' });
        newObjects.push({ id: 't3', x: 1, y: 2, type: 'decoration', variant: 'tree_round' });
        newObjects.push({ id: 'fl1', x: 3, y: 4, type: 'decoration', variant: 'flower' });
    }
    // Complete
    if (stageIndex >= 5) {
        newObjects.push({ id: 'trac', x: 3, y: 3, type: 'vehicle', variant: 'tractor' });
    }
    // Complex
    if (stageIndex >= 6) {
        newObjects.push({ id: 'comp', x: 1, y: 4, type: 'building', variant: 'complex' });
    }

    setObjects(newObjects);
  }, [stageIndex]);

  // --- RENDER OBJECT DISPATCHER ---
  const renderObjectContent = (obj: GameObject) => {
      switch(obj.variant) {
          case 'house': return <House3D />;
          case 'barn': return <Barn3D />;
          case 'complex': return <Complex3D />;
          case 'tree_pine': return <Tree3D variant="pine" />;
          case 'tree_round': return <Tree3D variant="round" />;
          case 'rock': return <Voxel width={30} depth={30} height={15} x={10} y={10} color="#4b5563" sideColor="#1f2937" />;
          case 'stump': return <Voxel width={15} depth={15} height={10} x={17} y={17} color="#78350f" />;
          case 'fence': return (
              <>
                <Voxel width={5} depth={5} height={15} x={0} y={22} color="#d97706" />
                <Voxel width={5} depth={5} height={15} x={45} y={22} color="#d97706" />
                <Voxel width={50} depth={4} height={4} x={0} y={22} z={10} color="#b45309" />
              </>
          );
          case 'cow': return <Billboard x={0} y={0} z={10} scale={1.5}>🐄</Billboard>;
          case 'tractor': return <Billboard x={0} y={0} z={10} scale={1.5}>🚜</Billboard>;
          case 'flower': return <Billboard x={0} y={0} z={5}>🌸</Billboard>;
          default: return null;
      }
  };

  return (
    <div className="relative w-full h-[400px] bg-sky-200 rounded-[2rem] overflow-hidden shadow-inner border-4 border-white/50 group select-none">
       
       {/* Background Sky */}
       <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100">
           <div className="absolute top-10 right-10 text-yellow-400 animate-spin-slow"><Sun size={64} fill="currentColor" /></div>
           <div className="absolute top-20 left-10 text-white opacity-80 animate-pulse"><Cloud size={48} fill="currentColor" /></div>
       </div>

       {/* ISO CAMERA CONTAINER */}
       <div className="absolute inset-0 flex items-center justify-center perspective-[1000px]">
           <div 
             className="relative transition-transform duration-1000 ease-in-out"
             style={{
                 width: `${GRID_SIZE * TILE_SIZE}px`,
                 height: `${GRID_SIZE * TILE_SIZE}px`,
                 transformStyle: 'preserve-3d',
                 transform: 'rotateX(60deg) rotateZ(-45deg)', // ISOMETRIC VIEW
                 marginTop: '50px'
             }}
           >
               {/* RENDER TILES & OBJECTS */}
               {objects.map(obj => {
                   const isGround = ['ground', 'water', 'road'].includes(obj.type);
                   
                   // Colors
                   let color = '#86efac'; // Grass
                   let sideColor = '#4ade80';
                   let height = 10;
                   let zOffset = 0;

                   if (obj.type === 'water') {
                       color = '#3b82f6'; sideColor = '#2563eb'; height = 8; zOffset = -2;
                   } else if (obj.type === 'road') {
                       color = '#fcd34d'; sideColor = '#fbbf24';
                   } else if (obj.variant === 'mud') {
                       color = '#a16207'; sideColor = '#713f12';
                   }

                   return (
                       <div 
                         key={obj.id}
                         className="absolute transition-all duration-500"
                         style={{
                             left: `${obj.x * TILE_SIZE}px`,
                             top: `${obj.y * TILE_SIZE}px`,
                             width: `${TILE_SIZE}px`,
                             height: `${TILE_SIZE}px`,
                             transformStyle: 'preserve-3d',
                             zIndex: obj.type === 'water' ? 0 : (isGround ? 1 : 10 + obj.x + obj.y) // Sorting
                         }}
                       >
                           {/* Base Block */}
                           {isGround && (
                               <Voxel 
                                 width={TILE_SIZE} 
                                 depth={TILE_SIZE} 
                                 height={height} 
                                 z={zOffset}
                                 color={color} 
                                 sideColor={sideColor}
                                 className="hover:brightness-110 cursor-pointer"
                               />
                           )}

                           {/* Object On Top */}
                           {!isGround && renderObjectContent(obj)}
                       </div>
                   );
               })}
           </div>
       </div>

       {/* STAGE LABEL */}
       <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-white/50">
           <p className="text-xs font-bold text-slate-400 uppercase">Seviye</p>
           <p className="text-xl font-black text-indigo-600">LVL {stageIndex + 1}</p>
       </div>

       {/* DEBUGGER */}
       <div className="absolute top-4 left-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur p-3 rounded-xl border border-white/10 text-white w-32">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/20">
                <Eye size={14} /> <span className="text-xs font-bold">Debug</span>
            </div>
            <div className="flex flex-col gap-1 h-32 overflow-y-auto">
                {stages.map(s => (
                    <button key={s} onClick={() => setDebugStage(s)} className={`text-[10px] text-left px-2 py-1 rounded ${activeStageId===s ? 'bg-indigo-600' : 'hover:bg-white/10'}`}>
                        {s}
                    </button>
                ))}
            </div>
       </div>

    </div>
  );
};

export default FarmVisualizer;
