import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import { Toaster } from "sonner";

const Providers = () => {
  return (
    <SessionProvider>
      <Outlet />
      <Toaster />
    </SessionProvider>
  );
};

export default Providers;
