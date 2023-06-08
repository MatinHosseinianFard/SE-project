import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../axios.js';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { login } from '../../store/store.js';

import "./Login.css"

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ورود';
  }, []);

  const loginHandler = (event) => {
    event.preventDefault();
    
    let access = true;

    if (username.length < 5) {
      access = false;
      setUsernameError('نام کاربری حداقل باید دارای ۵ کاراکتر باشد.');
    } else {
      setUsernameError(null);
    }

    if (password.length < 8) {
      access = false;
      setPasswordError('رمز باید حداقل باید دارای ۸ کاراکتر باشد.');
    } else {
      setPasswordError(null);
    }

    if (access) {
      axios
        .post('/api/token/', {
          username: username,
          password: password,
        })
        .then((response) => {
          const token = response.data.access;
          const refresh = response.data.refresh;
          dispatch(login(token, refresh));
          navigate('/');
        })
        .catch((error) => {
          console.log(error)
          setUsernameError('نام کاربری یا رمز عبور اشتباه است.');
        });
    }
  };

  return (
    <section className="login">
      <div className="login-grid">
        <div className="login-container login-grid">
          <div className="login-form">
            <h1>ورود</h1>
            <form onSubmit={loginHandler}>
              <div className="login-form-control">
                {usernameError && (
                <p className="login-text-danger" >{usernameError}</p>
                )}
                <input
                  type="text"
                  placeholder="نام کاربری"
                  className="login-form-control"
                  id="usernameInput"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="login-form-control">
                {passwordError && (
                  <div className="login-text-danger">{passwordError}</div>
                )}
                <input
                  type="password"
                  placeholder="رمز"
                  className="login-form-control"
                  id="passwordInput"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="login-flex">
                  <input type="submit" value="ورود" className="login-btn login-btn-primary" />
                  <Link to="/signup">ثبت نام</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
