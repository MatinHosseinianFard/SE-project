import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import store from "./store/store.js"

import App from "./App";

import "./index.css";


const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App tab="home" />
  </Provider>
);
