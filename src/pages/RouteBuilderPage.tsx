import { useState, useEffect } from 'react';
import { Image, Layer, Stage, Rect } from 'react-konva';
import useImage from 'use-image';
import type { Hold, HoldType } from '@/lib/db_types';

const url = '/my_wall.jpg';

const mockHolds: Hold[] = [
  { id: '1', coord_a: 100, coord_b: 150, coord_c: 40, coord_d: 40, board_id: '1' },
  { id: '2', coord_a: 200, coord_b: 100, coord_c: 35, coord_d: 45, board_id: '1' },
  { id: '3', coord_a: 150, coord_b: 300, coord_c: 50, coord_d: 30, board_id: '1' },
];

const holdColors: Record<HoldType, string> = {
  unassigned: 'rgba(255, 255, 255, 0.2)',
  start: 'rgba(0, 255, 0, 0.6)',
  hand: 'rgba(0, 0, 255, 0.6)',
  foot: 'rgba(255, 255, 0, 0.6)',
  end: 'rgba(255, 0, 0, 0.6)',
};

const cycleOrder: HoldType[] = ['unassigned', 'start', 'hand', 'foot', 'end'];

export default function RouteBuilder() {
  const [image, status] = useImage(url, 'anonymous');
  const [routeHolds, setRouteHolds] = useState<Record<string, HoldType>>({});

  // Track window size for responsive scaling
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Listen for window resizes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleHoldClick = (holdId: string) => {
    setRouteHolds((prev) => {
      const currentType = prev[holdId] || 'unassigned';
      const currentIndex = cycleOrder.indexOf(currentType);
      const nextType = cycleOrder[(currentIndex + 1) % cycleOrder.length];
      return { ...prev, [holdId]: nextType };
    });
  };

  let scale = 1;
  let stageWidth = windowSize.width;
  let stageHeight = windowSize.height;

  if (image) {
    const scaleX = windowSize.width / image.width;
    const scaleY = windowSize.height / image.height;
    scale = Math.min(scaleX, scaleY) * 0.95;

    stageWidth = image.width * scale;
    stageHeight = image.height * scale;
  }

  return (
    <div className='flex justify-center items-center h-screen w-screen md:w-[calc(100vw-16rem)] bg-gray-950'>
      <Stage
        width={stageWidth}
        height={stageHeight}
        scale={{ x: scale, y: scale }}
      >
        <Layer>
          {status === 'loaded' && <Image image={image} />}

          {mockHolds.map((hold) => {
            const holdId = hold.id as string;
            const currentType = routeHolds[holdId] || 'unassigned';
            const isActive = currentType !== 'unassigned';

            return (
              <Rect
                key={holdId}
                x={Number(hold.coord_a)}
                y={Number(hold.coord_b)}
                width={Number(hold.coord_c)}
                height={Number(hold.coord_d)}
                stroke={holdColors[currentType]}
                strokeWidth={isActive ? (4 / scale) : (2 / scale)}
                fill={isActive ? holdColors[currentType] : 'transparent'}
                onClick={() => handleHoldClick(holdId)}
                onTap={() => handleHoldClick(holdId)}
                onMouseEnter={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'default';
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}