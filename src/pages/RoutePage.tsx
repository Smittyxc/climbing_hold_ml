import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';
import { getBoardsByUserId, getRoutesByUserId } from '@/supabaseActions/queries'; // <-- Add route query
import { Board, Route } from '@/lib/db_types'; // <-- Add Route type
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RoutesPage() {
  const { session } = useSession()
  const user = session?.user;

  const [userRoutes, setUserRoutes] = useState<Route[]>([]);
  const [userBoards, setUserBoards] = useState<Board[]>([]);

  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoadingRoutes(false);
        setIsLoadingBoards(false);
        return;
      }

      // Fetch both routes and boards simultaneously
      const [routesData, boardsData] = await Promise.all([
        getRoutesByUserId(user.id),
        getBoardsByUserId(user.id)
      ]);

      setUserRoutes(routesData || []);
      setUserBoards(boardsData || []);

      setIsLoadingRoutes(false);
      setIsLoadingBoards(false);
    };

    fetchData();
  }, [user?.id]);

  return (
    <div className="relative min-h-screen w-full pb-24 md:pb-6">
      {/* --- MAIN VIEW: LIST OF ROUTES --- */}
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Your Routes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoadingRoutes ? (
            <>
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </>
          ) : userRoutes.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No routes found. Tap the + to create your first climb!
            </div>
          ) : (
            userRoutes.map((route) => (
              <Link
                key={route.id} // <-- Note: Moved key to the Link component where it belongs!
                to={`/routes/${route.board_id}/${route.id}`}
                className="block"
              >
                <div className="p-3 border rounded-md flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{route.name}</span>
                  {route.grade && (
                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {route.grade}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* --- FLOATING ACTION BUTTON & DIALOG: SELECT BOARD --- */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-20 md:bottom-6 right-6 z-50 rounded-full shadow-lg h-14 w-14"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-106]">
          <DialogHeader>
            <DialogTitle>Create New Route</DialogTitle>
            <DialogDescription>
              Select which board you want to build a climb on.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {isLoadingBoards ? (
              <Skeleton className="h-12 w-full rounded-md" />
            ) : userBoards.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center">
                You don't have any boards yet. <br />
                <Link to="/boards" className="text-primary underline">Create a board first</Link>.
              </div>
            ) : (
              userBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/routes/${board.id}/new`}
                  className="block"
                >
                  <div className="p-3 border rounded-md flex items-center justify-between hover:border-primary transition-colors">
                    <span className="font-medium">{board.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}