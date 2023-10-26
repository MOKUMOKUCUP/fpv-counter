import { createBrowserRouter } from "react-router-dom";
import Root from "./pages/root";
import New from "./pages/new";
import Game from "./pages/game";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/new",
    element: <New />,
  },
  {
    path: "/games/:id",
    element: <Game />,
  },
]);
