import { useState, useEffect } from 'react';
import type { BoardWithHolds, HoldType, Route } from '@/lib/db_types';
import { useParams } from 'react-router-dom';
import { CompleteRoute, getBoardWithHolds, getCompleteRoute, getRouteDetailsById } from '@/supabaseActions/queries';
import KonvaRouteDisplay from './KonvaDisplay';
import { Skeleton } from '@/components/ui/skeleton';




export default function ClimbDisplay() {
  const [completeRoute, setCompleteRoute] = useState<CompleteRoute | null>([]);
  const { boardId, routeId } = useParams<{ boardId: string, routeId: string }>();
  const [boardData, setBoardData] = useState<BoardWithHolds | null>(null);
  const [routeDetails, setRouteDetails] = useState<Route | null>();
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = boardData?.image_url || '';
  // const { session, defaultBoard } = useSession();


  useEffect(() => {
    const fetchBoard = async () => {
      if (!boardId) return;

      const boardAndHolds = await getBoardWithHolds(boardId);
      const routeHolds = await getCompleteRoute(routeId)
      const routeData = await getRouteDetailsById(routeId)

      setCompleteRoute(routeHolds)
      setRouteDetails(routeData)

      setBoardData(boardAndHolds);
      setIsLoading(false);
    };

    fetchBoard();
  }, [boardId, routeId]);

  const allHolds = completeRoute?.map(hold => hold.holds) || [];

  const routeHolds = completeRoute?.reduce((acc, routeHold) => {
    acc[routeHold.hold_id] = routeHold.type || 'hand';
    return acc
  }, {} as Record<string, HoldType>);

  const handleHoldClick = () => {
    return
  };




  return (
    <div className='w-full h-screen'>
      {isLoading ? (
        <Skeleton />
      ) : (
        <KonvaRouteDisplay
          imageUrl={imageUrl}
          allHolds={allHolds}
          routeHolds={routeHolds || {}}
          onHoldClick={handleHoldClick}
          isViewOnly={true}
          routeDetails={routeDetails || null}
        />

      )}

    </div>

  );
}