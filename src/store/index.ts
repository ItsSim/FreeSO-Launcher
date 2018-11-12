import { createStore, applyMiddleware, compose } from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { History, createMemoryHistory } from "history";

// fsolauncher
// \src\store\index.ts

import thunk from "redux-thunk";
import rootReducer from "./reducers";

export const history: History = createMemoryHistory();
export const middleware = [thunk, routerMiddleware(history)];
export const store = createStore(
   connectRouter(history)(rootReducer),
   {},
   compose(
      applyMiddleware(...middleware),
      window["__REDUX_DEVTOOLS_EXTENSION__"] &&
         window["__REDUX_DEVTOOLS_EXTENSION__"]()
   )
);