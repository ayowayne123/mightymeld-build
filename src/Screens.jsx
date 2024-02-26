import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import * as icons from "react-icons/gi";
import { Tile } from "./Tile";
import { TbBulb } from "react-icons/tb";
import toast, { Toaster } from "react-hot-toast";

export const possibleTileContents = [
  icons.GiHearts,
  icons.GiWaterDrop,
  icons.GiDiceSixFacesFive,
  icons.GiUmbrella,
  icons.GiCube,
  icons.GiBeachBall,
  icons.GiDragonfly,
  icons.GiHummingbird,
  icons.GiFlowerEmblem,
  icons.GiOpenBook,
  icons.GiWineGlass,
  icons.GiTShirt,
  icons.GiMedicalPack,
];

const mainlevels = [
  {
    number: 0,
    unlocked: true,
    tilesCount: 4,
    hintCount: 1,
  },
  {
    number: 1,
    unlocked: true,
    tilesCount: 8,
    hintCount: 2,
  },
  {
    number: 2,
    unlocked: false,
    tilesCount: 12,
    hintCount: 3,
  },
  {
    number: 3,
    unlocked: false,
    tilesCount: 16,
    hintCount: 3,
  },
  {
    number: 4,
    unlocked: false,
    tilesCount: 20,
    hintCount: 4,
  },
  {
    number: 5,
    unlocked: false,
    tilesCount: 24,
    hintCount: 2,
  },
];

export function StartScreen({ start }) {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="bg-pink-100 w-72 h-72 text-pink-500 flex flex-col items-center justify-center gap-4 rounded-lg">
          <h1 className="font-bold text-3xl text-pink-500">Memory</h1>
          <p>Flip over tiles looking for pairs</p>
          <button
            onClick={start}
            className="rounded-full text-white bg-gradient-to-b from-pink-400 to-pink-600 w-40 place-content-center  p-3 text-xl"
          >
            Play
          </button>
        </div>
      </div>
    </>
  );
}

export function PlayScreen({ end, current }) {
  const [tiles, setTiles] = useState(null);
  const [tryCount, setTryCount] = useState(0);

  //There's levels to this
  const [currentLevel, setCurrentLevel] = useState(() => {
    const storedCurrent = JSON.parse(localStorage.getItem("current-level"));
    if (storedCurrent) return storedCurrent;
    else return 0;
  });

  const [levels, setlevels] = useState(() => {
    const storedLevels = JSON.parse(localStorage.getItem("levels"));
    if (storedLevels) return storedLevels;
    else return mainlevels;
  });

  //Tentatively this hint number will change
  const [hintCount, setHintCount] = useState(3);
  const [hintUsed, setHintUsed] = useState(false);

  const tileCount = levels[currentLevel].tilesCount;

  const getTiles = () => {
    // Throw error if count is not even.
    if (tileCount % 2 !== 0) {
      throw new Error("The number of tiles must be even.");
    }

    // Use the existing list if it exists.
    if (tiles) return tiles;

    const pairCount = tileCount / 2;

    // Take only the items we need from the list of possibilities.
    const usedTileContents = possibleTileContents.slice(0, pairCount);

    // Double the array and shuffle it.
    const shuffledContents = usedTileContents
      .concat(usedTileContents)
      .sort(() => Math.random() - 0.5)
      .map((content) => ({ content, state: "start" }));

    setTiles(shuffledContents);
    return shuffledContents;
  };

  useEffect(() => {
    getTiles();
  }, [currentLevel]);

  useEffect(() => {
    localStorage.setItem("current-level", JSON.stringify(currentLevel));
  }, [currentLevel]);
  useEffect(() => {
    localStorage.setItem("levels", JSON.stringify(levels));
  }, [levels]);

  const selectLevel = (levelNumber) => {
    if (passedLevel(levelNumber)) {
      setTryCount(0);
      setHintCount(3);
      setCurrentLevel(levelNumber);
      setHintUsed(false); // Reset hintUsed state when changing levels
    } else if (!passedLevel(levelNumber)) {
      window.alert("You haven't passed this level yet");
    }
  };
  const passedLevel = (levelNumber) => {
    const level = levels.find((thisLevel) => thisLevel.number === levelNumber);
    setTiles(null);
    setTryCount(0);
    setHintCount(3);
    return level;
  };

  const flip = (i) => {
    // Is the tile already flipped? We don’t allow flipping it back.
    if (tiles[i].state === "flipped") return;

    // How many tiles are currently flipped?
    const flippedTiles = tiles.filter((tile) => tile.state === "flipped");
    const flippedCount = flippedTiles.length;

    // Don't allow more than 2 tiles to be flipped at once.
    if (flippedCount === 2) return;

    // On the second flip, check if the tiles match.
    if (flippedCount === 1) {
      setTryCount((c) => c + 1);

      const alreadyFlippedTile = flippedTiles[0];
      const justFlippedTile = tiles[i];

      let newState = "start";

      if (alreadyFlippedTile.content === justFlippedTile.content) {
        confetti({
          ticks: 100,
        });
        newState = "matched";
        setHintUsed(false);
      }

      // After a delay, either flip the tiles back or mark them as matched.
      setTimeout(() => {
        setTiles((prevTiles) => {
          const newTiles = prevTiles.map((tile) => ({
            ...tile,
            state: tile.state === "flipped" ? newState : tile.state,
          }));

          // If all tiles are matched, the game is over.
          if (newTiles.every((tile) => tile.state === "matched")) {
            handleLevelCompleted();
            // setTimeout(end, 0);
          }

          return newTiles;
        });
      }, 1000);
    }

    setTiles((prevTiles) => {
      return prevTiles.map((tile, index) => ({
        ...tile,
        state: i === index ? "flipped" : tile.state,
      }));
    });
  };

  const handleResetGame = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset the game? This action will lose all your progress."
    );
    if (confirmReset) {
      localStorage.clear();
      // Reset necessary states or perform any additional actions here
    }
  };

  //Function that shows you hints
  const handleHintClick = () => {
    if (hintCount === 0) {
      //Set an alert for when hint has been used
      window.alert("You have no more hints");
      return;
    }

    setHintUsed(true);

    if (!hintUsed) {
      setHintCount(hintCount - 1);
      const startCards = tiles.filter((tile) => tile.state === "start");
      let rightPair = false;
      let card1, card2;

      //A loop that checks all the cards to see which is the same
      for (let i = 0; i < startCards.length; i++) {
        for (let j = i + 1; j < startCards.length; j++) {
          if (startCards[i].content === startCards[j].content) {
            card1 = tiles.findIndex((tile) => tile === startCards[i]);
            card2 = tiles.findIndex((tile) => tile === startCards[j]);
            //we set Card 1 and Card 2 to be our found cards
            rightPair = true;
            break;
          }
        }
        if (rightPair) {
          break;
        }
      }

      //indicate the cards have been hinted

      if (rightPair) {
        setTiles((prevTiles) => {
          return prevTiles.map((tile, i) => {
            if (i === card1 || i === card2) {
              return { ...tile, state: "revealed" };
            }
            return tile;
          });
        });
        //might do something here to show that hint has been used or something
      }
    }
  };

  const handleLevelCompleted = () => {
    if (currentLevel < levels.length - 1) {
      const updatedLevels = [...levels];
      updatedLevels[currentLevel + 1].unlocked = true;

      const storedBestTry = JSON.parse(
        localStorage.getItem(`best-try-${currentLevel}`)
      );
      if (!storedBestTry || tryCount < storedBestTry) {
        localStorage.setItem(
          `best-try-${currentLevel}`,
          JSON.stringify(tryCount + 1)
        );
      }

      setlevels(updatedLevels);
      setCurrentLevel(currentLevel + 1);
      setTiles(null);
      setTryCount(0);
      setHintCount(3);
    } else {
      window.alert("Congrats! You beat the Game!");
      setTimeout(end, 0);
    }
  };

  const tilers = getTiles();

  const getBestTry = (currentLevel) => {
    const storedBestTry = JSON.parse(
      localStorage.getItem(`best-try-${currentLevel}`)
    );
    return storedBestTry ? storedBestTry : "-";
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col h-screen w-full items-center justify-center rounded-lg text-indigo-500">
        <div className="gap-2 flex ">
          <p>Remaining Hints :</p>
          {hintCount}
        </div>
        <div className="font-bold flex gap-3 flex-row mb-2">
          Level<span>{currentLevel}</span>
        </div>
        <div className="mb-4 gap-3 flex flex-row overflow-x-auto">
          {levels.map((level) => (
            <button
              key={level.number}
              onClick={() => selectLevel(level.number)}
              disabled={!level.unlocked}
              className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded-xl text-xs cursor-pointer  ${
                !level.unlocked && "opacity-50 cursor-not-allowed"
              }`}
            >
              Lv{level.number}
            </button>
          ))}
        </div>
        <div className="flex flex-row justify-between items-center w-72 ">
          <div className="flex flex-row items-center gap-1 justify-center mb-8">
            Tries{" "}
            <p className="bg-indigo-100 font-semibold rounded-lg px-2">
              {tryCount}
            </p>
          </div>

          <div className="flex flex-row items-center gap-1 justify-center mb-8 text-emerald-600 text-semibold">
            Best Try :
            <p className="bg-emerald-100 font-semibold rounded-lg px-2 text-emerald-600">
              {getBestTry(currentLevel)}
            </p>
          </div>
        </div>

        <div className="w-80 grid grid-cols-4 gap-3 p-3 bg-indigo-100 rounded-lg mb-4">
          {tilers.map((tile, i) => (
            <Tile key={i} flip={() => flip(i)} {...tile} />
          ))}
        </div>

        <button
          className="flex flex-row justify-center items-center px-4 py-2 rounded-full bg-amber-500 hover:bg-rose-600 text-white font-semibold gap-2 text-[14px] "
          onClick={handleHintClick}
          disabled={hintCount === 0}
        >
          <span>
            Hint<span className="mr-1 ml-1">{hintCount}</span>
          </span>

          <TbBulb size={24} />
        </button>
        <button
          onClick={handleResetGame}
          className="flex justify-center items-center px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold gap-2 text-[14px] mt-4"
        >
          Reset Game
        </button>
      </div>
    </>
  );
}
