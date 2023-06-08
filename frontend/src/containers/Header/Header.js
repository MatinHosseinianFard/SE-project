import React, {useRef, useState, useEffect} from 'react'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import Container from "../Container/Container.js";

import { logout, setTables } from '../../store/store.js';

const Header = () => {
  const isAuthenticated = useSelector(state => state.isAuthenticated);
  const suggestions = useSelector(state => state.suggestions);
  const user_first_name = useSelector(state => state.user_first_name);
  const user_last_name = useSelector(state => state.user_last_name);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);

  const inputRef = useRef();

  useEffect(() => {
    setShowSearchBar(pathname === "/suggest")
  }, [pathname]);

  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(logout());
  }
  
  const searchHandler = (event) => {
    event.preventDefault();
    if (event.target.search.value !== "") {
      const newTables = [];
    for (let i = 0; i < suggestions.length; i++) {
      if (String(suggestions[i].total_credit) === event.target.search.value) {
        newTables.push(suggestions[i]);
      }
    }
    inputRef.current.value = "";
    dispatch(setTables(newTables));
    }
    else {
      dispatch(setTables(suggestions));
    }
  };

  const suggestionhandler = () => {
    dispatch(setTables(suggestions));
  }
  
  const pathhandler = () => {
    setPathname(window.location.pathname); 
  }

  return (
    <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div onClick={pathhandler} className="container-fluid">
              <Link className="navbar-brand" to="/">انتخاب واحد نوشیروانی</Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {!isAuthenticated ? (
                    <Container>
                      <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" to="/login">ورود</Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" to="/signup">ثبت نام</Link>
                      </li>
                    </Container>
                  ) : (null)}
                  <li className="nav-item">
                    <Link className="nav-link active" to="/about">درباره ما</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link active" to="/">|</Link>
                  </li>
                  {isAuthenticated ? (
                    <Container>
                      <li className="nav-item">
                        <Link className="nav-link active" to="/favourite">{user_first_name} {user_last_name}</Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link active link-info" to="/favourite">دیدن علاقه مندی ها</Link>
                      </li>
                    </Container>
                  ) : (null)}
                  
                  {suggestions.length > 0 ? (
                    <li className="nav-item">
                    <Link className="nav-link active" to="/suggest" onClick={suggestionhandler}>پیشنهادات</Link>
                    </li>
                  ) : null}
                  <li className="nav-item">
                    <Link className="nav-link active" to="/" onClick={logoutHandler}>خروج</Link>
                  </li>
                </ul>
                  {showSearchBar ? (
                    <form className="d-flex" onSubmit={(event) => searchHandler(event)}>
                    <input
                      className="form-control me-2"
                      name="search"
                      type="search"
                      placeholder="تعداد واحد مدنظر"
                      aria-label="Search"
                      ref={inputRef}
                    />
                    <button className="me-2 btn btn-outline-success" type="submit">
                      نمایش
                    </button>
                  </form>
                  ) : null}
              </div>
            </div>
          </nav>
        </div>
  )
}


export default Header