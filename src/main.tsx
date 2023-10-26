import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";

import { getApp, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzSsznp0B5rxZa8NREVeVBNxKAV6oDsbk",
  authDomain: "fpv-counter.firebaseapp.com",
  projectId: "fpv-counter",
  storageBucket: "fpv-counter.appspot.com",
  messagingSenderId: "863916243030",
  appId: "1:863916243030:web:eea8761b95b6398c27e3f7",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
