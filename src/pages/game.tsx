import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import type { Game, Team } from "../utils/firestore";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import clsx from "clsx";
import { RxSlash } from "react-icons/rx";
import ConfettiExplosion from "react-confetti-explosion";

export default function Game() {
  const { id } = useParams();
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    if (id === undefined) return;
    const db = getFirestore(getApp());

    getDoc(doc(db, "games", id)).then((gameDoc) => {
      if (!gameDoc.exists()) {
        navigate("/");
        return;
      }
      setGame(gameDoc.data() as Game);
    });

    const q = collection(db, `games/${id}/teams`);
    const unsub = onSnapshot(q, (querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        setTeams((teams) => {
          if (teams.find((team) => team.id === doc.id)) {
            return teams;
          } else {
            return [...teams, doc.data() as Team];
          }
        });
      });

      querySnapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          setTeams((teams) => {
            const nextTeams = teams.map((team) => {
              if (team.id === change.doc.id) {
                return change.doc.data() as Team;
              } else {
                return team;
              }
            });
            return nextTeams;
          });
        }
      });
    });

    return unsub;
  }, [id]);

  const count = useCallback(
    async (teamId: string, delta: number) => {
      if (game === undefined || id === undefined) return;
      try {
        setSending(true);
        const db = getFirestore(getApp());
        const team = teams.find((team) => team.id === teamId);
        if (!team) return;

        try {
          await updateDoc(doc(db, `games/${id}/teams`, teamId), {
            count: increment(delta),
          });
        } catch (e) {
          console.error(e);
        }
      } catch (e) {
        console.error(e);
        window.alert("エラーが発生しました");
      } finally {
        setSending(false);
      }
    },
    [game, id, teams]
  );

  const reset = useCallback(async () => {
    if (window.confirm("リセットしますか？")) {
      if (game === undefined || id === undefined) return;
      try {
        setSending(true);
        const db = getFirestore(getApp());
        getDocs(collection(db, `games/${id}/teams`)).then((querySnapshot) => {
          querySnapshot.forEach((d) => {
            updateDoc(doc(db, `games/${id}/teams`, d.id), {
              count: 0,
            });
          });
        });
      } catch (e) {
        console.error(e);
        window.alert("エラーが発生しました");
      } finally {
        setSending(false);
      }
    }
  }, [game, id]);

  const destroy = useCallback(async () => {
    if (window.confirm("レースを削除しますか？")) {
      if (game === undefined || id === undefined) return;
      try {
        setSending(true);
        const db = getFirestore(getApp());
        getDocs(collection(db, `games/${id}/teams`)).then((querySnapshot) => {
          querySnapshot.forEach((d) => {
            deleteDoc(doc(db, `games/${id}/teams`, d.id));
          });
        });
        await deleteDoc(doc(db, "games", id));
        navigate("/");
      } catch (e) {
        console.error(e);
        window.alert("エラーが発生しました");
      } finally {
        setSending(false);
      }
    }
  }, [game, id]);

  if (game === undefined) return <div>Loading...</div>;

  const sortedTeams = [...teams.sort((a, b) => b.count - a.count)];
  const fixedTeams = [
    ...teams.sort((a, b) => {
      if (a.id > b.id) {
        return 1;
      } else {
        return -1;
      }
    }),
  ];

  return (
    <div className="bg-black h-screen p-6">
      <h1 className="text-white text-2xl font-bold">{game.name}</h1>

      <div className="flex gap-6 flex-col mt-6">
        {sortedTeams.map((team) => {
          const rank =
            [...new Set(sortedTeams.map((t) => t.count))].indexOf(team.count) +
            1;
          const goal = game.maxCount && team.count >= game.maxCount;
          if (goal && !isExploding) {
            setIsExploding(true);
            setTimeout(() => {
              setIsExploding(false);
            }, 5000);
          }

          return (
            <div
              key={team.id}
              className={clsx(
                "flex border-2 px-2 pl-1 py-1 rounded-sm",
                goal && "border-[#ecd292]"
              )}
            >
              <div className="bg-white w-14 h-14 font-bold text-4xl flex items-center mr-1 rounded-sm">
                <div className="mx-auto">{rank}</div>
              </div>
              <div
                className=" text-white p-2 border-l-8 text-2xl flex items-center"
                style={{ borderColor: team.color }}
              >
                {team.name}
              </div>
              {isExploding && (
                <ConfettiExplosion
                  force={1.2}
                  duration={6000}
                  particleCount={100}
                />
              )}

              <div className="flex items-center ml-auto">
                <div className="text-3xl text-white">{team.count}</div>
                {game.maxCount && (
                  <div className="text-xs text-gray-300 ml-1 flex items-center pt-1">
                    <RxSlash /> <div>{game.maxCount}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="fixed bottom-0 right-0 left-0 shadow bg-gray-100 p-2 rounded-tl-xl rounded-tr-xl flex flex-col gap-4"
        style={{ display: showPanel ? "block" : "none" }}
      >
        <div className="border-b flex gap-4 pb-2 text-sm px-2">
          <button onClick={() => navigate("/")}>トップに戻る</button>
          <button onClick={() => destroy()}>削除</button>
          <button onClick={() => reset()}>カウントリセット</button>
          <button onClick={() => setShowPanel(false)}>パネルを隠す</button>
        </div>
        <div className="flex gap-6 mt-6 mb-2 flex-col px-2">
          {fixedTeams.map((team) => (
            <div key={team.id} className="flex border-b last:border-b-0 pb-6">
              <div className="flex justify-center items-center text-xl">
                <div>{team.name}</div>
              </div>
              <div className="ml-auto flex gap-6">
                <button
                  className={clsx(
                    "border w-12 h-12 text-xl shadow",
                    sending && "shadow-none bg-gray-200"
                  )}
                  onClick={() => count(team.id, 1)}
                >
                  <AiOutlinePlus className="mx-auto" />
                </button>
                <button
                  className={clsx(
                    "border w-12 h-12 text-xl shadow",
                    sending && "shadow-none bg-gray-200"
                  )}
                  onClick={() => count(team.id, -1)}
                >
                  <AiOutlineMinus className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
