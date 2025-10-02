"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import AuthInitializer from "./AuthInitializer";

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
