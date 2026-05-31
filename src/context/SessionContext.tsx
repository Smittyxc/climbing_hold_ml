import { createContext, useContext, useEffect, useState } from "react";
import supabaseClient from "../lib/supabaseClient";
import LoadingPage from "../pages/LoadingPage";
import { Session } from "@supabase/supabase-js";
import { getUserById } from "@/supabaseActions/queries";
import { useQuery } from "@tanstack/react-query";

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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 1. THE AUTH LISTENER (Kept in useEffect because it's a subscription)
  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_, currentSession) => {
        setSession(currentSession);
        setIsAuthLoading(false);
      }
    );

    // MOBILE FIX: Prevent infinite loading when switching tabs/apps
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        supabaseClient.auth.startAutoRefresh();
        supabaseClient.auth.getSession();
      } else {
        supabaseClient.auth.stopAutoRefresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const {
    data: userProfile,
    isLoading: isProfileLoading
  } = useQuery({
    queryKey: ['userProfile', session?.user.id],
    queryFn: () => getUserById(session?.user.id || null),
    enabled: !!session?.user.id,
  });

  useEffect(() => {
    if (userProfile) {
      setDefaultBoard(userProfile.default_board_id);
    } else if (!session) {
      setDefaultBoard(null);
    }
  }, [userProfile, session]);

  // The app is "loading" if we are waiting for Auth, OR if Auth is done (and logged in) but we are still fetching the Profile.
  const isAppLoading = isAuthLoading || (!!session?.user.id && isProfileLoading);

  return (
    <SessionContext.Provider value={{ session, defaultBoard, setDefaultBoard }}>
      {isAppLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  );
};