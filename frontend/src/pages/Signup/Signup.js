import React, { useState, useEffect } from "react";

import { Link } from 'react-router-dom';

import axios from '../../axios.js';
import { useNavigate } from 'react-router-dom';

import "./Signup.css";

const Signup = () => {

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState(false);

  const [password1, setPassword1] = useState("");
  const [password1Error, setPassword1Error] = useState(false);
  const [password1ErrorMessage, setPassword1ErrorMessage] = useState(false);

  const [password2, setPassword2] = useState("");
  const [password2Error, setPassword2Error] = useState(false);
  const [password2ErrorMessage, setPassword2ErrorMessage] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [firstNameErrorMessage, setFirstNameErrorMessage] = useState(false);

  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState(false);
  const [lastNameErrorMessage, setLastNameErrorMessage] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ثبت نام';
  }, []);

  const signupHandler = (event) => {
    event.preventDefault();
    let access = true;
    if (username.length < 5) {
      access = false;
      setUsernameError(true);
      if (username.trim() === "") {

        setUsernameErrorMessage("نام کاربری معتبر نیست.");
      } else {

        setUsernameErrorMessage("نام کاربری باید حداقل دارای ۵ کاراکتر باشد.");
      }
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (password1.length < 8) {
      access = false;
      setPassword1Error(true);
      if (password1.trim() === "") {

        setPassword1ErrorMessage("رمز معتبر نیست.");
      } else {

        setPassword1ErrorMessage("رمز حداقل باید دارای ۸ کاراکتر باشد.");
      }
    } else {

        setPassword1Error(false);
      setPassword1ErrorMessage('');
    }

    if (password2.length < 8) {
      access = false;
      setPassword2Error(true);
      if (password2.length === 0) {

        setPassword2ErrorMessage("رمز معتر نیست.");
      } else {

        setPassword2ErrorMessage("رمز باید حداقل دارای ۸ کاراکتر باشد.");
      }
    } else {

        setPassword2Error(false);
      setPassword2ErrorMessage('');
    }

    if (password1 !== password2) {
      access = false;
      setPassword1Error(true);
      setPassword2Error(true);
      setPassword1ErrorMessage("دو رمز وارد شده یکی نیستند.");
      setPassword2ErrorMessage("دو رمز وارد شده یکی نیستند.");
    } else {
      if (!password1ErrorMessage && !password2ErrorMessage) {

        setPassword1ErrorMessage("");
      }
    }

    if (access) {
        axios
        .post('/api/dj-rest-auth/registration/', {
          username: username,
          password1: password1,
          password2: password2,
          first_name: firstName,
          last_name: lastName
        })
        .then(response => {
          alert("با موفقیت انجام شد.")
          navigate("/")
        })
        .catch(error => {
          console.log(error.response.data);
          if (error.response.data.username) {
            setUsernameError(true);
            setUsernameErrorMessage(error.response.data.username.join(" "));
          }
          else if (error.response.data.password1) {
            setPassword1Error(true);
            setPassword1ErrorMessage(error.response.data.password1.join(" "));
          }
          else if (error.response.data.password2) {
            setPassword2Error(true);
            setPassword2ErrorMessage(error.response.data.password2.join(" "));
          }
          else if (error.response.data.first_name) {
            setFirstNameError(true);
            setFirstNameErrorMessage(error.response.data.first_name.join(" "));
          }
          else if (error.response.data.last_name) {
            setLastNameError(true);
            setLastNameErrorMessage(error.response.data.last_name.join(" "));
          }
          else if (error.response.data.non_field_errors) {
            setPassword1Error(true);
            setPassword1ErrorMessage(error.response.data.non_field_errors.join(" "));
          }
          navigate("/signup")
        });
    }

  }
  return (
    <section className="signup">
      <div className="signup-grid">
        <div className="signup-container signup-grid">
          <div className="signup-form">
            <h1>ثبت نام</h1>
            <form onSubmit={signupHandler}>
              <div className="signup-form-control">
                {usernameError ? (
                    <div className="invalid-feedback">
                    {usernameErrorMessage}
                    </div>
                ) : null}
                <input
                  type="text" name="username" maxLength="150" autoFocus
                  placeholder="نام کاربری"
                  required
                  id="id_username"
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="signup-form-control">
                {password1Error ? (
                <div className="invalid-feedback">
                    {password1ErrorMessage}
                </div>
                ) : null}
                <input type="password" name="password1" autoComplete="new-password"
                  placeholder="رمز"
                  required
                  id="id_password1"
                  onChange={(event) => setPassword1(event.target.value)}
                />
              </div>
              <div className="signup-form-control">
                {password2Error ? (
                <div className="invalid-feedback">
                    {password2ErrorMessage}
                </div>
                ) : null}
                <input type="password" name="password2" autoComplete="new-password"
                  placeholder="تکرار رمز"
                  required
                  id="id_password2"
                  onChange={(event) => setPassword2(event.target.value)}
                />
              </div>
              <div className="signup-form-control">
                {firstNameError ? (
                <div className="invalid-feedback">
                    {firstNameErrorMessage}
                </div>
                ) : null}
                <input type="text" name="first_name" maxLength="100"
                  placeholder="نام"
                  required
                  id="id_first_name"
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className="signup-form-control">
                {lastNameError ? (
                <div className="invalid-feedback">
                    {lastNameErrorMessage}
                </div>
                ) : null}
                <input type="text" name="last_name" maxLength="100"
                  placeholder="نام خانوادگی"
                  required
                  id="id_last_name"
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
              <div className="signup-flex">
                <input
                  type="submit"
                  value="ثبت نام"
                  className="signup-btn signup-btn-primary"
                />
                <Link to="/">ورود</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
