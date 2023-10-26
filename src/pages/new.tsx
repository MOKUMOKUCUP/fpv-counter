import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Game, Team } from "../utils/firestore";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { ulid } from "ulid";

export default function New() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [teamColor, setTeamColor] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [maxCount, setMaxCount] = useState<string>("0");

  const handleSubmit = async () => {
    const db = getFirestore(getApp());
    const num = Number.isNaN(maxCount) ? 0 : Number(maxCount);
    const game: Game = JSON.parse(
      JSON.stringify({
        name,
        ts: Date.now(),
        teams,
        maxCount: num === 0 ? undefined : num,
      })
    );
    const doc = await addDoc(collection(db, "games"), game);

    navigate(`/games/${doc.id}`);
  };

  const addTeam = () => {
    setTeams([
      ...teams,
      { id: ulid(), name: teamName, color: teamColor, count: 0 },
    ]);
    setTeamName("");
  };

  return (
    <div className="bg-gray-50 h-screen py-6">
      <div className="w-64 mx-auto flex gap-6 flex-col">
        <h1 className="text-xl font-bold text-center">ゲームを作成する</h1>

        <section>
          <h3 className="mt-6">① ゲーム名を決める</h3>

          <input
            type="text"
            value={name}
            placeholder="ゲーム名"
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mt-2 w-full"
          />
        </section>

        <section>
          <h3 className="">② 最大周数を設定する</h3>
          <div className="text-xs mt-2 text-gray-500">0で設定無し</div>

          <input
            type="number"
            className="border p-2 mt-2 w-full"
            value={maxCount}
            onChange={(e) => setMaxCount(e.target.value)}
          />
        </section>

        <section>
          <h3 className="">③ チームを追加する</h3>

          <div className="text-center mt-2 flex gap-2 flex-col">
            {teams.map((team) => (
              <div
                key={team.color}
                style={{ backgroundColor: team.color }}
                className="p-1"
              >
                <div className="bg-white">{team.name}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="border flex flex-col gap-2 p-2 bg-white">
          <input
            type="text"
            value={teamName}
            placeholder="チーム名"
            onChange={(e) => setTeamName(e.target.value)}
            className="border p-2"
          />
          <div className="flex flex-row items-center gap-2">
            <input
              type="color"
              className=""
              value={teamColor}
              onChange={(e) => setTeamColor(e.target.value)}
            />
            <div>チームカラー</div>
          </div>
          <button onClick={addTeam} className="border rounded-sm p-1">
            チームを追加
          </button>
        </div>

        <section>
          <h3 className="">④ ゲームを作成する</h3>
          <button
            onClick={handleSubmit}
            className="mt-2 w-full font-bold border p-1 bg-black text-white rounded-md"
          >
            作成する
          </button>
        </section>

        <section className="text-center">
          <Link to="/" className="mt-2 w-full p-1 underline">
            トップに戻る
          </Link>
        </section>
      </div>
    </div>
  );
}
