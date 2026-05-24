import { useState, useEffect } from 'react';
import { Image, Layer, Stage, Rect } from 'react-konva';
import useImage from 'use-image';
import type { Hold, HoldType } from '@/lib/db_types';

// 1. Define the props the component expects
interface KonvaRouteDisplayProps {
  imageUrl: string;
  allHolds: Hold[];
  routeHolds: Record<string, HoldType>
  onHoldClick: (id: string) => void;
}

const holdColors: Record<HoldType, string> = {
  unassigned: 'rgba(255, 255, 255, 0.2)',
  start: 'rgba(0, 255, 0, 0.6)',
  hand: 'rgba(0, 0, 255, 0.6)',
  foot: 'rgba(255, 255, 0, 0.6)',
  end: 'rgba(255, 0, 0, 0.6)',
};

export default function KonvaRouteDisplay({
  imageUrl,
  allHolds,
  routeHolds,
  onHoldClick
}: KonvaRouteDisplayProps) {
  const [image, status] = useImage(imageUrl, 'anonymous');

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

          {allHolds.map((hold) => {
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
                onClick={() => onHoldClick(holdId)}
                onTap={() => onHoldClick(holdId)}
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