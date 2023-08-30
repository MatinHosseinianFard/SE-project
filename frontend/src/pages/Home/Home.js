import React, { useEffect, useState } from "react";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Container from "../../containers/Container/Container.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import axios from "../../axios.js";

import { logout, setSuggestions, setTables, setPathName } from "../../store/store.js";

const Home = () => {
  const accordionNumber = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  const [open, setOpen] = useState(true);

  
  const [Data, setData] = useState(null);
  const [Departemant, setDepartemant] = useState([]);
  const [SelectedSection, setSelectedSection] = useState([]);
  const [Notice, setNotice] = useState(false);
  const [Impossible, setImpossible] = useState(false);
  const [Message, setMessage] = useState('');
  
  const distpatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'صفحه اصلی';
    axios
      .get("/api/home")
      .then((response) => {
        setData(response.data);
        setOpen(false)
      })
      .catch((error) => {
        console.error("خطا در دریافت اطلاعات:", error);
        distpatch(logout());
        navigate("/");
      });
  }, []);

  useEffect(() => {
    if (Data) {
        setOpen(false);
      const tempDepartemant = [];
      const dept_name = Object.keys(Data)
      for (let i = 0; i < dept_name.length; i++) {
        if (dept_name[i] !== "notice") {
          const dic = {};
          dic[dept_name[i]] = Data[dept_name[i]];
          tempDepartemant.push(dic);
        }
      }
      setDepartemant(tempDepartemant);
    }
  }, [Data]);
  
  const sumbitHandler = (event) => {
    event.preventDefault();
    setOpen(true);
    let query = {choosed: {
        selected_courses: "",
        selected_sections: ""
    }}
    for (let i = 0; i < SelectedSection.length; i++) {
        const [course_pk, section_pk] = SelectedSection[i].split(" ");
        query.choosed.selected_courses += " " + course_pk;
        query.choosed.selected_sections += " " + section_pk
        query.choosed.selected_courses = query.choosed.selected_courses.trim()
        query.choosed.selected_sections = query.choosed.selected_sections.trim()
    }
    axios
        .post('/api/suggest/', query)
        .then(response => {
            distpatch(setPathName("/suggest"));
            setOpen(false);
            if (response.data.length === 1 && response.data[0].notice) {
                setNotice(true);
                setMessage(response.data[0].message);
            }
            else if (response.data.length === 1 && response.data[0].impossible){
                setImpossible(true);
                setMessage(response.data[0].message);
            }
            else{
                distpatch(setSuggestions(response.data));
                distpatch(setTables(response.data));
                navigate("/suggest")   
            }
        })
        .catch(error => {
          console.log(error);
          distpatch(logout());
          navigate("/")
        })
  }
  
  const selectHandler = (event) => {
    setSelectedSection([...SelectedSection, event.target.value])
  }

  return (
    <Container>
      {Data ? (
          <Container>
            <br/><br/>
            <div className="container">
            <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </symbol>
                <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </symbol>
            </svg>
            <div className="alert alert-primary d-flex align-items-center" role="alert">
                <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use href="#info-fill"/></svg>
                <div>
                این دروس مربوط به ترم 4021 است. برای اضافه یا تصحیح درس به آدرس تلگرام قرار داده شده در قسمت درباره ما پیام دهید.
                </div>
            </div>
            
            {(Notice || Impossible) ? (<div className="alert alert-danger d-flex align-items-center" role="alert">
                <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use href="#exclamation-triangle-fill"/></svg>
                <div>
                {Message}
                </div>
            </div>) : null}
            
            {Data.notice ? (
                <Container>
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use href="#exclamation-triangle-fill"/></svg>
                <div>
                حداقل 12 واحد انتخاب کنید
                </div>
            </div>
                </Container>
            ) : null}
            
            <br/>
                <form method="POST" onSubmit={(event) => sumbitHandler(event)}>
                    <div className="accordion" id="accordionPanelsStayOpenExample">
                        {Departemant.map((item, index) => {
                            // const [key, value] = Object.entries(departemant);
                            return (
                                Object.keys(item).map((departemant) => {
                                    return (
                                        <div key={departemant} className="accordion-item">
                                            <h2 className="accordion-header" id={`panelsStayOpen-${accordionNumber[index]}`}>
                                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#panelsStayOpen-collapse${accordionNumber[index]}`} aria-expanded="false" aria-controls={`panelsStayOpen-collapse${accordionNumber[index]}`}>
                                                {departemant}
                                                </button>
                                            </h2>
                                            <div id={`panelsStayOpen-collapse${accordionNumber[index]}`} className="accordion-collapse collapse" aria-labelledby={`panelsStayOpen-heading${accordionNumber[index]}`}>
                                                <div style={{ overflowX: 'auto' }} className="accordion-body">
                                                    <table className="text-nowrap table table-striped table-sm">
                                                        <thead>
                                                        <tr>
                                                            <th scope="col">#</th>
                                                            <th className="text-center" scope="col">تعداد واحد</th>
                                                            <th className="text-center" scope="col">تاریخ امتحان</th>
                                                            <th className="text-center" scope="col">ساعت کلاسها</th>
                                                            <th className="text-center" scope="col">استاد</th>
                                                            <th className="text-center" scope="col">جنسیت</th>
                                                            <th className="text-center" scope="col">گروه درس</th>
                                                            <th className="text-center" scope="col">کد</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {Object.keys(Departemant[index][departemant]).length !== 0 ? Object.keys(Departemant[index][departemant]).map((course) => {
                                                            return (
                                                                Departemant[index][departemant][course].sections.map((section) => {
                                                                    let section_group = section.code.split("_");
                                                                    section_group = section_group[section_group.length - 1];
                                                                    return (
                                                                        <tr key={section.pk}>
                                                                            <th scope="row"><input className="text-center form-check-input" name="choosed" type="checkbox" onChange={(event) => selectHandler(event)} value={`${Departemant[index][departemant][course].pk} ${section.pk}`} id="flexCheckDefault" /> {course} {section_group}</th>
                                                                            <td className="text-center">{Departemant[index][departemant][course].credits}</td>

                                                                            <td className="text-center">{Departemant[index][departemant][course].exam_date !== "0" ? 
                                                                            `${Departemant[index][departemant][course].exam_date} | ${Departemant[index][departemant][course].exam_time}` : `ندارد`}</td>
                                                    
                                                                            <td className="text-center">
                                                                            {section.time_slot.map((time) => {
                                                                                return (
                                                                                    <Container >{time.day} </Container>
                                                                                )
                                                                            })}
                                                                            {section.time_slot[0].start}-{section.time_slot[0].end}
                                                                            </td> 
                                                                            <td className="text-center">{section.instuctor}</td>
                                                                            <td className="text-center">{section.gender}</td>
                                                                            <td className="text-center">{section_group}</td>
                                                                            <td className="text-center"><code>{section.code}</code></td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            )
                                                        }) : null}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )
                        })}
                    </div>
                    <br/>
                    <input type="submit" value="نشان دادن برنامه های پیشنهادی" className="btn btn-primary"/>
                    <br/>
                    <br/>
                </form>
            </div>
          </Container>
      ) : null}
      <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
    </Container>
  );
};

export default Home;
