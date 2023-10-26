import { Link } from "react-router-dom";
import image from "../assets/ai-image.png";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { getApp } from "firebase/app";
import { Game } from "../utils/firestore";
import { format } from "date-fns";

type GameWithId = Game & { id: string };

export default function Root() {
  const [games, setGames] = useState<GameWithId[]>([]);

  useEffect(() => {
    (async () => {
      const db = getFirestore(getApp());
      const ref = await getDocs(collection(db, "games"));
      const games = ref.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GameWithId[];
      setGames(games.sort((a, b) => b.ts - a.ts));
    })();
  }, []);

  return (
    <div className="bg-gray-50 h-screen py-8">
      <h1 className="text-center text-2xl">FPV Counter</h1>
      <div className="w-[300px] mt-4 mx-auto">
        <img src={image} />
      </div>

      <div className="text-center mt-8">
        <Link
          to="/new"
          className="bg-black text-white shadow px-6 py-4 rounded-md mx-auto text-lg"
        >
          新しいレースを作成する
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-3 max-w-[480px] mx-auto px-2">
        {games.map((game) => (
          <div key={game.id}>
            <Link
              to={`/games/${game.id}`}
              className="bg-white shadow py-4 px-6 rounded-md mx-auto flex border"
            >
              <div className="text-lg">{game.name}</div>
              <div className="text-sm text-gray-400 flex items-center ml-auto">
                <div>{format(new Date(game.ts), "yyyy/MM/dd HH:mm")}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
