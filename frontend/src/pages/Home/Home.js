import React, { useEffect, useState } from "react";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import axios from "../../axios.js";
import Container from "../../containers/Container/Container.js";

import { logout, setSuggestions, setTables, setPathName } from "../../store/store.js";

const Home = () => {
    const accordionNumber = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const [open, setOpen] = useState(true);

    const [Data, setData] = useState(null);
    const [Departemant, setDepartemant] = useState([]);
    const [SelectedSection, setSelectedSection] = useState([]);

    const distpatch = useDispatch()
    const navigate = useNavigate()

    const showToastMessage = (message) => {
        toast.error(message, {
            position: toast.POSITION.TOP_RIGHT
        });
    };

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
                    const group_name = Object.keys(Data[dept_name[i]])
                    const dic = {};
                    dic[dept_name[i]] = []
                    for (let j = 0; j < group_name.length; j++) {
                        const dic2 = {}
                        dic2[group_name[j]] = {}
                        dic2[group_name[j]] = Data[dept_name[i]][group_name[j]]
                        dic[dept_name[i]].push(dic2);
                    }
                    tempDepartemant.push(dic);
                }
            }
            setDepartemant(tempDepartemant);
        }
    }, [Data]);

    const sumbitHandler = (event) => {
        event.preventDefault();
        setOpen(true);
        let query = {
            choosed: {
                selected_courses: "",
                selected_sections: ""
            }
        }
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
                    showToastMessage(response.data[0].message)
                }
                else if (response.data.length === 1 && response.data[0].impossible) {
                    showToastMessage(response.data[0].message)
                }
                else {
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

    const selectHandler = (event, key) => {
        const sectionElement = document.querySelector(`[data-key="${key}"]`);
        const inputSectionElement = document.querySelector(`[data-key="input${key}"]`);
        if (inputSectionElement.checked === true) {
            inputSectionElement.checked = false;
            sectionElement.style.backgroundColor = '#ffffff'
            const computedStyle = getComputedStyle(sectionElement);
            const bsTableAccentBgValue = computedStyle.getPropertyValue('--bs-table-accent-bg');
            if (bsTableAccentBgValue !== 'transparent') {
                sectionElement.style.setProperty('--bs-table-accent-bg', 'rgba(0, 0, 0, 0.05)');
            }
        }
        else{
            inputSectionElement.checked = true;
            sectionElement.style.backgroundColor = 'rgb(187, 192, 194)';
            const computedStyle = getComputedStyle(sectionElement);
            const bsTableAccentBgValue = computedStyle.getPropertyValue('--bs-table-accent-bg');
            if (bsTableAccentBgValue !== 'transparent') {
                sectionElement.style.setProperty('--bs-table-accent-bg', 'rgb(187, 192, 194)');
            }
        }
        const value = sectionElement.getAttribute('data-section-pk')
        if (SelectedSection.includes(value)) {
            const index = SelectedSection.indexOf(value);
            if (index > -1) { 
                SelectedSection.splice(index, 1)
            setSelectedSection(SelectedSection);
            }
        }
        else{
            setSelectedSection([...SelectedSection, value])
        }
    }
    const changeBackgroundOver = (event, key) => {
        const sectionElement = document.querySelector(`[data-key="${key}"]`);        
        const computedStyle = getComputedStyle(sectionElement);
        sectionElement.style.backgroundColor = 'rgb(187, 192, 194)'
        const bsTableAccentBgValue = computedStyle.getPropertyValue('--bs-table-accent-bg');
        if (bsTableAccentBgValue !== 'transparent') {
            sectionElement.style.setProperty('--bs-table-accent-bg', 'rgb(187, 192, 194)');
        }
    }
    
    const changeBackgroundLeave = (event, key) => {
        const sectionElement = document.querySelector(`[data-key="${key}"]`);
        const inputSectionElement = document.querySelector(`[data-key="input${key}"]`);
        if (!inputSectionElement.checked) {
            sectionElement.style.backgroundColor = 'white'
        }

        const computedStyle = getComputedStyle(sectionElement);
        const bsTableAccentBgValue = computedStyle.getPropertyValue('--bs-table-accent-bg');
        if (bsTableAccentBgValue !== 'transparent') {
            sectionElement.style.setProperty('--bs-table-accent-bg', 'rgba(0, 0, 0, 0.05)');
        }
        if (inputSectionElement.checked) {
            sectionElement.style.setProperty('--bs-table-accent-bg', 'rgb(187, 192, 194)');
        }
    }


    return (
        <Container>
            {Data ? (
                <Container>
                    <br /><br />
                    <div className="container">
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                            <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                            </symbol>
                            <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                            </symbol>
                        </svg>
                        <div className="alert alert-primary d-flex align-items-center" role="alert">
                            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use href="#info-fill" /></svg>
                            <div>
                                این دروس مربوط به ترم 4021 است. برای اضافه یا تصحیح درس به آدرس تلگرام قرار داده شده در قسمت درباره ما پیام دهید.
                            </div>
                        </div>

                        <ToastContainer autoClose={2000} rtl="rtl" />

                        <br />
                        <form method="POST" onSubmit={(event) => sumbitHandler(event)}>

                            <div className="accordion" id="accordionExample">
                                {Departemant.map((departemantDic, departemantDicIndex) => {
                                    return (
                                        Object.keys(departemantDic).map((departemantKey) => {
                                            return (
                                                <Container>
                                                    <div className="accordion-item">
                                                        <h2 className="accordion-header" id={`heading${accordionNumber[departemantDicIndex]}`}>
                                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${accordionNumber[departemantDicIndex]}`} aria-expanded="false" aria-controls={`collapse${accordionNumber[departemantDicIndex]}`}>
                                                                {departemantKey}
                                                            </button>
                                                        </h2>
                                                        <div id={`collapse${accordionNumber[departemantDicIndex]}`} className="accordion-collapse collapse" aria-labelledby={`heading${accordionNumber[departemantDicIndex]}`} data-bs-parent="#accordionExample">
                                                            <div className="accordion-body">
                                                                <div className="accordion px-3" id="accordionPanelsStayOpenExample">
                                                                    {departemantDic[departemantKey].map((groupDic, groupDicIndex) => {
                                                                        return (
                                                                            Object.keys(groupDic).map((groupKey) => {
                                                                                return (
                                                                                    <div className="accordion-item">
                                                                                        <h2 className="accordion-header" id={`panelsStayOpen-heading${accordionNumber[groupDicIndex]}`}>
                                                                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#panelsStayOpen-collapse${accordionNumber[groupDicIndex]}`} aria-expanded="false" aria-controls={`panelsStayOpen-collapse${accordionNumber[groupDicIndex]}`}>
                                                                                                {groupKey}
                                                                                            </button>
                                                                                        </h2>
                                                                                        <div id={`panelsStayOpen-collapse${accordionNumber[groupDicIndex]}`} className="accordion-collapse collapse" aria-labelledby={`panelsStayOpen-heading${accordionNumber[groupDicIndex]}`}>
                                                                                            <div className="overflow-auto accordion-body">
                                                                                                <table className="text-nowrap table table-striped table-sm ">
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
                                                                                                        
                                                                                                        {Object.keys(groupDic[groupKey]).length !== 0 ? Object.keys(groupDic[groupKey]).map((course) => {
                                                                                                            return (
                                                                                                                groupDic[groupKey][course].sections.map((section) => {
                                                                                                                    let section_group = section.code.split("_");
                                                                                                                    section_group = section_group[section_group.length - 1];
                                                                                                                    return (
                                                                                                                        <tr key={section.pk} data-key={section.pk} style={{ cursor: "pointer" }} onMouseOver={(event) => changeBackgroundOver(event, section.pk)} onMouseLeave={(event) => changeBackgroundLeave(event, section.pk)} data-section-pk={`${groupDic[groupKey][course].pk} ${section.pk}`} onClick={(event) => selectHandler(event, section.pk)} type="checkbox">
                                                                                                                            <th scope="row"><input style={{ cursor: "pointer" }} data-key={`input${section.pk}`} className="text-center form-check-input" name="choosed" type="checkbox" onClick={(event) => selectHandler(event, section.pk)} value={`${groupDic[groupKey][course].pk} ${section.pk}`} id="flexCheckDefault" /> {course} {section_group}</th>
                                                                                                                            <td className="text-center">{groupDic[groupKey][course].credits}</td>

                                                                                                                            <td className="text-center">{groupDic[groupKey][course].exam_date !== "0" ?
                                                                                                                                `${groupDic[groupKey][course].exam_date} | ${groupDic[groupKey][course].exam_time}` : `ندارد`}</td>

                                                                                                                            <td className="text-center">
                                                                                                                                {section.time_slot.length > 0 ? section.time_slot.map((time) => {
                                                                                                                                    return (
                                                                                                                                        <Container >{time.day} </Container>
                                                                                                                                    )
                                                                                                                                }) : null}
                                                                                                                                {section.time_slot.length > 0 ? section.time_slot[0].end : null}-{section.time_slot.length > 0 ? section.time_slot[0].start : null}
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
                                                                                                </table>                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            })
                                                                        )
                                                                    })}


                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Container>
                                            )
                                        })

                                    )
                                })}
                            </div>
                            <br />
                            <input type="submit" value="نشان دادن برنامه های پیشنهادی" className="btn btn-primary" />
                            <br />
                            <br />
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
