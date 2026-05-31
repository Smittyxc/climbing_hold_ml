import { createContext, useContext, useEffect, useState } from "react";
import supabaseClient from "../lib/supabaseClient";
import LoadingPage from "../pages/LoadingPage";
import { Session } from "@supabase/supabase-js";
import { getUserById } from "@/supabaseActions/queries";

const SessionContext = createContext<{
  session: Session | null;
  defaultBoard: string | null;
  setDefaultBoard: (boardId: string | null) => void;
}>({
  session: null,
  defaultBoard: null,
  setDefaultBoard: () => { },
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

type Props = { children: React.ReactNode };
export const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [defaultBoard, setDefaultBoard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_, currentSession) => {
        setSession(currentSession);

        if (currentSession?.user.id) {
          const response = await getUserById(currentSession.user.id);
          if (response) {
            setDefaultBoard(response.default_board_id);
          }
        } else {
          setDefaultBoard(null);
        }

        setIsLoading(false);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, defaultBoard, setDefaultBoard }}>
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  );
};
