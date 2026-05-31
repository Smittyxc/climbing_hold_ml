import { useEffect, useState } from 'react';
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
    <div className="relative h-screen w-full max-w-md mx-auto flex flex-col bg-background">

      <header className="sticky top-0 z-10 bg-white border-b px-6 py-5">
        <h1 className="text-3xl font-bold tracking-tight">Your Routes</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4 pb-24 md:pb-6">
        {isLoadingRoutes ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : userRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <p className="text-muted-foreground">
              No routes found. Tap the + to create your first climb!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {userRoutes.map((route) => (
              <Link
                key={route.id}
                to={`/routes/${route.board_id}/${route.id}`}
                className="block group"
              >
                <div className="p-4 border rounded-lg flex items-center justify-between bg-card hover:border-primary/50 hover:bg-accent transition-all shadow-sm">
                  <span className="font-semibold text-card-foreground group-hover:text-accent-foreground">
                    {route.name}
                  </span>
                  {route.grade && (
                    <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md">
                      {route.grade}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>


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