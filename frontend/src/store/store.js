import { configureStore } from "@reduxjs/toolkit";
import axios from "../axios.js";
import thunk from "redux-thunk";


// Define initial state
const initialState = {
  suggestions: [],
  in_suggest: false,
  pathname: "/",
  tables: [],
  search_value: "",
  isAuthenticated: false,
  token: "",
  refresh: "",
  user_id: "",
  user_first_name: "",
  user_last_name: "",
  signup_now: false,
  login_now: false
};

// Define actions
const LOGIN = "LOGIN";
const LOGOUT = "LOGOUT";
const SET_USER = "SET_USER";
const SET_SUGGESTIONS = "SET_SUGGESTIONS";
const SET_SEARCH_VALUE = "SET_SEARCH_VALUE";
const SET_TABLES = "SET_TABLES";
const SET_IN_SUGGEST = "SET_IN_SUGGEST";
const SET_PATHNAME = "SET_PATHNAME";
const SET_SIGNUP_NOW = "SET_SIGNUP_NOW";
const SET_LOGIN_NOW = "SET_LOGIN_NOW";

// Define action creators
export const login = (token, refresh) => ({
  type: LOGIN,
  payload: { token, refresh },
});

export const logout = () => ({
  type: LOGOUT,
});

export const setUser = (user_id, user_first_name, user_last_name) => ({
  type: SET_USER,
  payload: {user_id, user_first_name ,user_last_name },
});

export const setSuggestions = (suggestions) => ({
  type: SET_SUGGESTIONS,
  payload: suggestions,
});

export const setSearchValue = (search_value) => ({
  type: SET_SEARCH_VALUE,
  payload: search_value,
});

export const setTables = (tables) => ({
  type: SET_TABLES,
  payload: tables,
});

export const setInSuggest = (in_suggest) => ({
  type: SET_IN_SUGGEST,
  payload: in_suggest,
});

export const setPathName = (pathname) => ({
  type: SET_PATHNAME,
  payload: pathname,
});

export const setSignupNow = (signup_now) => ({
  type: SET_SIGNUP_NOW,
  payload: signup_now,
});

export const setLoginNiw = (login_now) => ({
  type: SET_LOGIN_NOW,
  payload: login_now,
});


// Define reducers
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      const { token, refresh } = action.payload;
      localStorage.setItem("token", token);
      localStorage.setItem("refresh", refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return {
        ...state,
        isAuthenticated: true,
        token,
        refresh,
      };
    case LOGOUT:
      
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      axios.defaults.headers.common["Authorization"] = "";
      return {
        ...state,
        suggestions: [],
        in_suggest: false,
        tables: [],
        search_value: "",
        isAuthenticated: false,
        token: "",
        refresh: "",
        user_id: "",
        user_first_name: "",
        user_last_name: "",
      };
      
    case SET_USER:
        const {user_id, user_first_name, user_last_name} = action.payload;
      return {
        ...state,
        user_id,
        user_first_name,
        user_last_name
      };
    case SET_SUGGESTIONS:
        const suggestions = action.payload;
        suggestions.pop();
      return {
        ...state,
        suggestions: suggestions
      };
    
    case SET_SEARCH_VALUE:
        const search_value = action.payload;
      return {
        ...state,
        search_value
      };
    
      case SET_TABLES:
        const tables = action.payload;
      return {
        ...state,
        tables
      };
      
      case SET_IN_SUGGEST:
        const in_suggest = action.payload;
      return {
        ...state,
        in_suggest
      };
      
      case SET_PATHNAME:
        const pathname = action.payload;
      return {
        ...state,
        pathname
      };

      case SET_SIGNUP_NOW:
        const signup_now = action.payload;
      return {
        ...state,
        signup_now
      };

      case SET_LOGIN_NOW:
        const login_now = action.payload;
      return {
        ...state,
        login_now
      };
    default:
      return state;
  }
};

// Create store
const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk],
});
// Define side effects
export const onStart = () => (dispatch) => {

  const token = localStorage.getItem("token");
  const refresh = localStorage.getItem("refresh");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios
      .get("/api/dj-rest-auth/user/")
      .then((response) => {
        const user_id = response.data.pk;
        const user_first_name = response.data.first_name;
        const user_last_name = response.data.last_name;
        dispatch(login(token, refresh));
        dispatch(setUser(user_id, user_first_name, user_last_name));
      })
      .catch((error) => {
        if (refresh) {
          axios
            .post("/api/token/refresh/", { refresh })
            .then((response) => {
              const newToken = response.data.access_token;
              dispatch(login(newToken, refresh));
            })
            .catch(() => {
              dispatch(logout());
            });
        } else {
          dispatch(logout());
        }
      });
  } else {
    dispatch(logout());
  }
};

export default store;
