import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Analytics } from '@vercel/analytics/react';

import { onStart } from "./store/store.js";

import Container from "./containers/Container/Container.js";
import Header from "./containers/Header/Header.js";

import Home from "./pages/Home/Home.js";
import Suggest from "./pages/Suggest/Suggest.js";
import Favourite from "./pages/Favourite/Favourite.js";
import Login from "./pages/Login/Login.js";
import Signup from "./pages/Signup/Signup.js";
import About from "./pages/About/About.js";



const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.isAuthenticated);
  
  useEffect(() => {
    dispatch(onStart());
  });

  return (
    <Container>
      <Analytics />
      <Router>
        {!isAuthenticated ? (
          <Routes>
            <Analytics />
            <Route path="/" element={<Login/>} exact />
            <Route path="/signup" element={<Signup/>} exact />
          </Routes>
        ) : (
          <Container>
            <Header/>
            <Routes>
            <Analytics />
              <Route path="/" element={<Home/>} exact />
              <Route path="/suggest" element={<Suggest/>} exact />
              <Route path="/favourite" element={<Favourite/>} exact />
              <Route path="/login" element={<Login/>} exact />
              <Route path="/signup" element={<Signup/>} exact />
              <Route path="/about" element={<About/>} />
            </Routes>
          </Container>
        )}
      </Router>
    </Container>
  );
};

export default App;
