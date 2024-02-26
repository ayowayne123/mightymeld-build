import { useState } from "react";
import { StartScreen, PlayScreen } from "./Screens";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [gameState, setGameState] = useState("start");

  switch (gameState) {
    case "start":
      return <StartScreen start={() => setGameState("play")} />;
    case "play":
      return (
        <>
          <Toaster /> <PlayScreen end={() => setGameState("start")} />;
        </>
      );
    default:
      throw new Error("Invalid game state " + gameState);
  }
}

export default App;
