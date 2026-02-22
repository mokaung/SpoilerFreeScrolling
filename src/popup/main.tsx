import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/popup/App";
import "./index.css";

const root = document.getElementById("app");
if (!root) throw new Error("Missing #app root");
createRoot(root).render(<App />);
