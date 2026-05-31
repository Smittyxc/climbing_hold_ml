import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { Button } from "@/components/ui/button";
import supabaseClient from "@/lib/supabaseClient";
import { getBoardsByUserId, updateUserDefaultBoard } from "@/supabaseActions/queries";
import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
import { Board } from "@/lib/db_types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut } from "lucide-react";

const ProtectedPage = () => {
  const { session, setDefaultBoard, defaultBoard } = useSession();
  const userId = session?.user.id || "";
  const [boards, setBoards] = useState<Board[]>([]);
  const navigate = useNavigate();

  const boardItems = boards.map((board) => ({
    value: board.id,
    label: board.name,
  }));

  useEffect(() => {
    if (!userId) return;
    getBoardsByUserId(userId).then((response) => {
      setBoards(response ?? []);
    });
  }, [userId]);

  const handleBoardSelect = (value: string) => {
    if (value === "unselected") {
      setDefaultBoard(null);
    } else {

      updateUserDefaultBoard(value, session)
      setDefaultBoard(value);
    }
  };
  const defaultBoardName = boardItems.find(board => board.value === defaultBoard)?.label || undefined;
  return (
    <main className="flex max-w-3xl mx-auto flex-col">
      <header className="sticky top-0 flex justify-between px-3 items-center text-white bg-orange-800 h-16">
        <div className="w-6"></div>
        <div>[Name]</div>
        <Button
          variant="ghost"
          onClick={() => supabaseClient.auth.signOut().then(() => navigate("/"))}
        >
          <LogOut className="size-8" />
        </Button>
      </header>
      <div className="flex flex-col p-4">
        <h1 className="text-3xl font-bold pb-4">Welcome, "add public.users"</h1>
        {/* <p>Current User: {session?.user.email || "None"}</p> */}
        {defaultBoardName ? (
          <>
            <h2 className="pb-6 font-medium">Default Board:<span className="font-light pl-2">{defaultBoardName}</span></h2>
            <Label htmlFor="board-select">Change Board</Label>

          </>
        ) : (
          <Label htmlFor="board-select">Select a Board</Label>
        )}
        <>
          <Select
            onValueChange={handleBoardSelect}
            value={defaultBoard || 'unselected'}
          >
            <SelectTrigger className="w-full max-w-48 mt-1">
              <SelectValue placeholder="Select a board..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="clear-default" className="italic text-muted-foreground">
                  None
                </SelectItem>

                {boardItems.map(board => {
                  return (
                    <SelectItem key={board.value} value={board.value}>
                      {board.label}
                    </SelectItem>
                  )
                })}
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </>

      </div>
    </main>
  );
};

export default ProtectedPage;