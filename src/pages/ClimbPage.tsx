import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { getRoutesByUserId } from '@/supabaseActions/queries';
import { Route } from '@/lib/db_types';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export default function ClimbPage() {
  // Removed defaultBoard since it wasn't being used in the render
  const { session } = useSession();
  const user = session?.user;

  const [userRoutes, setUserRoutes] = useState<Route[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoadingRoutes(false);
        return;
      }
      const routesData = await getRoutesByUserId(user.id);

      setUserRoutes(routesData || []);
      setIsLoadingRoutes(false);
    };

    fetchData();
  }, [user?.id]);

  const sortedRoutes = [...userRoutes].sort((a, b) => {
    const aGrade = parseInt(a.grade?.slice(1) || '-1');
    const bGrade = parseInt(b.grade?.slice(1) || '-1');
    return aGrade - bGrade;

  })

  return (
    <div className="relative h-screen w-full max-w-md mx-auto flex flex-col bg-background">

      <header className="sticky top-0 z-10 bg-white border-b px-6 py-5">
        <h1 className="text-3xl font-bold tracking-tight">Your Climbs</h1>
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
            {sortedRoutes.map((route) => (
              <Link
                key={route.id}
                to={`/climb/${route.board_id}/${route.id}`}
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
    </div>
  );
}