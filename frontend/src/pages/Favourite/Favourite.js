import React, { useEffect, useState } from "react";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import axios from "../../axios.js";
import Container from "../../containers/Container/Container.js";
import { logout } from "../../store/store.js";

const Favourite = () => {
  const [open, setOpen] = useState(false);

  const [deleteEvent, setDeleteEvent] = useState(false);
  const [error, setError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTable, setCurrentTable] = useState(false);
  const [tables, setTables] = useState(false);
  
  const navigate = useNavigate();
  const distpatch = useDispatch();

  useEffect(() => {
    document.title = 'علاقه مندی ها';
  }, []);
  
  useEffect(() => {
    axios
      .get("/api/see-favourite")
      .then((response) => {
        // console.log(response);
        let data = response.data;
        const info = data.pop(); 
        setError(info.error);
        setIsEmpty(info.notice);
        setTables(response.data);
      })
      .catch((error) => {
        console.error("خطا در دریافت اطلاعات:", error);
        distpatch(logout());
        navigate("/");
      });

      // return setDeleteEvent(false);
  }, [deleteEvent]);

  
  useEffect(() => {
    setCurrentTable(tables[currentPage-1]);
  }, [currentPage, tables]);
  
  const showToastMessage = () => {
    toast.error('حذف شد.', {
        position: toast.POSITION.TOP_RIGHT
    });
  };

  const removeFavouriteHandler = (event) => {
    setOpen(true);
    event.preventDefault();
    let query = {
      favourite_pk: currentTable.favourite_pk
  }
  // setOpen(true)
  // setInterval(() => {
  //   setOpen(false)
  // }, 200);
    axios
        .post('/api/remove-favourite/', query)
        .then(response => {
          setOpen(false);
          console.log(response)
           setDeleteEvent(!deleteEvent);
           showToastMessage();
        })
        .catch(error => {
          setOpen(false);
          console.log(error);
          distpatch(logout());
          navigate("/");
        })  
  };
  
  const pageHandler = (event, value) => {
    event.preventDefault();
    setCurrentPage(currentPage + value);
  };


  return (
    <Container>
      <ToastContainer autoClose={1000} rtl="rtl"/>
      <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open}          >
            <CircularProgress color="inherit" />
      </Backdrop>
      {currentTable && !isEmpty ? (
        <div className="container">
          {error ? (
            <Container>
              <br/>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </symbol>
              </svg>
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use href="#exclamation-triangle-fill"/></svg>
                <div>
                  برنامه هایی که درس های آن دچار تغییر شدند از علاقه مندی حذف می شوند. 
                </div>
              </div>
            </Container>
          ) : null}
          <br/>
          <h5>تعداد واحد: {currentTable.total_credit}</h5><br/>
          <div style={{ overflowX: 'auto' }} className="container">
              <table style={{ overflowX: 'auto' }} className=" text-nowrap table table-striped must-light table-bordered">
                  <thead>
                    <tr>
                      <th scope="col">روز/ساعت</th>
                      <th className="text-center" scope="col">8-9.5</th>
                      <th className="text-center" scope="col">10-11.5</th>
                      <th className="text-center" scope="col">13.5-15</th>
                      <th className="text-center" scope="col">15.5-17</th>
                      <th className="text-center" scope="col">17.5-19</th>
  
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">شنبه</th>
                      {Object.keys(currentTable).map(day => {
                        if (day === "شنبه") {
                          return (
                            Object.keys(currentTable[day]).map((time) => {
                              return <td className="text-center">{currentTable[day][time]}</td>
                            })
                          );
                        } else {
                          return null;
                        }
                      })}
                    </tr>
                    <tr>
                      <th scope="row">یکشنبه</th>
                      {Object.keys(currentTable).map(day => {
                        if (day === "یکشنبه") {
                          return (
                            Object.keys(currentTable[day]).map((time) => {
                              return <td className="text-center">{currentTable[day][time]}</td>
                            })
                          );
                        } else {
                          return null;
                        }
                      })}
                    </tr>
                    <tr>
                      <th scope="row">دوشنبه</th>
                      {Object.keys(currentTable).map(day => {
                        if (day === "دوشنبه") {
                          return (
                            Object.keys(currentTable[day]).map((time) => {
                              return <td className="text-center">{currentTable[day][time]}</td>
                            })
                          );
                        } else {
                          return null;
                        }
                      })}
                    </tr>
                    <tr>
                      <th scope="row">سه‌شنبه</th>
                      {Object.keys(currentTable).map(day => {
                        if (day === "سه‌شنبه") {
                          return (
                            Object.keys(currentTable[day]).map((time) => {
                              return <td className="text-center">{currentTable[day][time]}</td>
                            })
                          );
                        } else {
                          return null;
                        }
                      })}
                    </tr>
                    <tr>
                      <th scope="row">چهارشنبه</th>
                      {Object.keys(currentTable).map(day => {
                        if (day === "چهارشنبه") {
                          return (
                            Object.keys(currentTable[day]).map((time) => {
                              return <td className="text-center">{currentTable[day][time]}</td>
                            })
                          );
                        } else {
                          return null;
                        }
                      })}
                    </tr>
                    <tr>
                      <th scope="row">پنجشنبه</th>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                    </tr>
                    <tr>
                      <th scope="row">جمعه</th>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                    </tr>
                  </tbody>
              </table>
              
            <div className="accordion accordion-flush" id="accordionFlushExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="flush-headingOne">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                    اطلاعات
                  </button>
                </h2>
                <div id="flush-collapseOne" className="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                  <div style={{ overflowX: 'auto' }} className="accordion-body">
                    <table className="text-nowrap table table-striped table-sm">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th className="text-center" scope="col">تعداد واحد</th>
                          <th className="text-center" scope="col">کلاس</th>
                          <th className="text-center" scope="col">تاریخ امتحان</th>
                          <th className="text-center" scope="col">استاد</th>
                          <th className="text-center" scope="col">جنسیت</th>
                          <th className="text-center" scope="col">گروه درس</th>
                          <th className="text-center" scope="col">کد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTable.informations.map((section) => {
                          let section_group = section.code.split("_");
                          section_group = section_group[section_group.length - 1];
                          return (
                              <tr key={section.code}>
                                <th scope="row">{section.name} {section_group}</th>
                                <td className="text-center">{section.credit}</td>
                                <td className="text-center">{section.room}</td>
                                  {section.exam_date !== "0" ? (
                                  !section.exam_conflict ? (<td className="text-center">{section.exam_date} | {section.exam_time}</td>) 
                                  : (<td className="text-center text-danger">{section.exam_date} | {section.exam_time}</td>)
                                  ) : <td className="text-center">ندارد</td> }

                                <td className="text-center">{section.instructor}</td>
                                <td className="text-center">{section.gender}</td>
                                <td className="text-center">{section.group}</td>
                                <td className="text-center"><code>{section.code}</code></td>
                              </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br/>
          <div className="container">
            <form method="POST" id="add-favourite" onSubmit={(event) => removeFavouriteHandler(event)}>
                <button type="submit" className="btn btn-danger">حذف کردن از علاقه مندی ها</button>
            </form>
            <br/>
            <nav aria-label="Page navigation example">
              <ul className="pagination">
                  {currentPage > 1 ? (
                    <li className="page-item"><a className="page-link" href="/" onClick={(event) => pageHandler(event, -1)}>قبلی</a></li>
                  ) : null}
                <li className="page-item"><a className="page-link" href="/" onClick={(event) => pageHandler(event, 0)}><span className="page-current">
                صفحه {currentPage} از {tables.length}
                </span></a></li>
                  {currentPage < tables.length ? (
                    <li className="page-item"><a className="page-link" href="/" onClick={(event) => pageHandler(event, 1)}>بعدی</a></li>
                  ) : null}
              </ul>
            </nav>
          </div>
          <br/>
          <br />
        </div>
      ) : (
        !isEmpty ? (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}          >
            <CircularProgress color="inherit" />
          </Backdrop>
        ) :
        (<Container>
          <div className="container">
            <br />
          <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
            <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </symbol>
          </svg>
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use href="#exclamation-triangle-fill"/></svg>
            <div>
              علاقه مندی وجود ندارد.
            </div>
          </div>
          </div>
        </Container>)
      )}
    </Container>
  );
};

export default Favourite;
