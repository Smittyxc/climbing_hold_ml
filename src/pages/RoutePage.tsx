import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';
import { getBoardsByUserId } from '@/supabaseActions/queries';
import { Board } from '@/lib/db_types';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export default function RoutesPage() {
  const { session } = useSession()
  const user = session?.user;
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      if (!user?.id) {
        setIsLoadingBoards(false);
        return;
      }

      const boards = await getBoardsByUserId(user.id);
      setUserBoards(boards || []);
      setIsLoadingBoards(false);
    };

    fetchBoards();

  }, [user?.id]);


  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Select Board</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoadingBoards ? (
          <>
            <Skeleton className="h-12 w-full rounded-md" />
          </>
        ) : userBoards.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No boards found. Create one to begin building routes!
          </div>
        ) : (
          userBoards.map((board) => (
            <Link to={`/routes/${board.id}`}>
              <div
                key={board.id}
                className="p-3 border rounded-md flex items-center justify-between"
              >
                <span className="font-medium">{board.name}</span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}