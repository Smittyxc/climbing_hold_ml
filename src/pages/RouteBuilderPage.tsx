import { useState, useEffect } from 'react';
import type { BoardWithHolds, HoldType, Route, RouteHoldInsert } from '@/lib/db_types';
import { useNavigate, useParams } from 'react-router-dom';
import { addRouteHolds, deleteRouteHolds, getBoardWithHolds, getRouteDetailsById, getRouteHoldsById, saveRoute, updateRoute } from '@/supabaseActions/queries';
import KonvaRouteDisplay from './KonvaDisplay';
import MobileRouteBuilder from '@/components/layout/mobile-route-builder';
import { toast } from 'sonner';
import { useSession } from '@/context/SessionContext';
import { Skeleton } from '@/components/ui/skeleton';



const cycleOrder: HoldType[] = ['unassigned', 'start', 'hand', 'foot', 'end'];

export default function RouteBuilder() {
  const navigate = useNavigate();
  const [routeHolds, setRouteHolds] = useState<Record<string, HoldType>>({});
  const { boardId, routeId } = useParams<{ boardId: string, routeId: string }>();
  const [boardData, setBoardData] = useState<BoardWithHolds | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = boardData?.image_url || '';
  const { session } = useSession();
  const user = session?.user;

  const [routeName, setRouteName] = useState("");
  const [routeGrade, setRouteGrade] = useState("");
  const [routeDetails, setRouteDetails] = useState<Route>()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      if (!boardId) return;

      const boardAndHolds = await getBoardWithHolds(boardId);
      if (routeId !== 'new') {
        const existingRouteHolds = await getRouteHoldsById(routeId)

        const existingHolds = existingRouteHolds ? existingRouteHolds.reduce((acc, hold) => {
          acc[hold.hold_id] = hold.type || 'unassigned'
          return acc
        }, {} as Record<string, HoldType>)
          : {};

        setRouteHolds(existingHolds)
        const routeDetails = await getRouteDetailsById(routeId);
        if (routeDetails) {
          setRouteDetails(routeDetails)
          setRouteName(routeDetails.name);
          setRouteGrade(routeDetails.grade || "");
        }
      }
      setBoardData(boardAndHolds);
      setIsLoading(false);
    };

    fetchBoard();
  }, [boardId, routeId]);

  const handleHoldClick = (holdId: string | null) => {
    if (!holdId) {
      return null
    }
    setRouteHolds((prev) => {
      const currentType = prev[holdId] || 'unassigned';
      const currentIndex = cycleOrder.indexOf(currentType);
      const nextType = cycleOrder[(currentIndex + 1) % cycleOrder.length];
      return { ...prev, [holdId]: nextType };
    });
  };

  const handleSaveRoute = async () => {
    if (!user?.id) {
      console.error("User not logged in");
      return;
    }

    if (!routeName.trim()) {
      alert("Please provide a route name.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const activeHolds = Object.entries(routeHolds).filter(([_, type]) => type !== 'unassigned');

    if (activeHolds.length === 0) {
      alert("Please select at least one hold for this route.");
      return;
    }

    try {
      let finalRouteId = routeId;
      if (routeId === 'new' && boardId) {
        // CREATE: Insert the new route and get the generated ID back
        const routeData = await saveRoute(
          boardId,
          routeName,
          routeGrade,
          user.id
        )

        finalRouteId = routeData.id;
      } else if (routeId) {
        // EDIT: Update the existing route's name and grade
        await updateRoute(routeId, routeName, routeGrade)
        await deleteRouteHolds(routeId)
      }

      // STEP 2: INSERT THE HOLDS
      const payload: RouteHoldInsert[] = activeHolds.map(([holdId, type]) => ({
        route_id: finalRouteId as string,
        hold_id: holdId,
        type: type as HoldType,
      }));

      await addRouteHolds(payload)

      toast.success("Successfully saved route!");
      setIsDrawerOpen(false);
      navigate('/routes');

    } catch (error) {
      console.error("Error saving route:", error);
      alert("There was an error saving your route. Please try again.");
    }
  };


  return (
    <div className='w-full h-screen'>
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          <KonvaRouteDisplay
            imageUrl={imageUrl}
            allHolds={boardData?.holds || []}
            routeHolds={routeHolds}
            onHoldClick={handleHoldClick}
            isViewOnly={false}
            routeDetails={routeDetails}
          />
          <MobileRouteBuilder
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            routeName={routeName}
            setRouteName={setRouteName}
            routeGrade={routeGrade}
            setRouteGrade={setRouteGrade}
            handleSaveRoute={handleSaveRoute}
          />
        </>
      )}

    </div>

  );
}