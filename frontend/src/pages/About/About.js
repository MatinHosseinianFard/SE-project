import React, {useEffect} from 'react'

import image from "../../assets/images/Matin2.jpg"

import "./About.css"

const About = () => {
  
  useEffect(() => {
    document.title = 'درباره ما';
  }, []);
  
  let style = {
    fontSize: "large"
  };
  return (
    <div style={style} className="contact-container contact-grid">
        <div className="matin contact-flex">
            <img src={image} alt="" />
            <h3 style={style} >متین حسینیان فرد</h3>
            <h3 style={style} id="email">ایمیل : <a href="mailto:matinhosseini795@gmail.com">matinhosseini795@gmail.com</a></h3>
            <h3 style={style} id="telegram">گیتهاب : <a href="https://github.com/MatinHosseinianFard/SE-project">MatinHosseinianFard</a></h3>
            <h3 style={style} id="telegram">تلگرام : <a href="https://t.me/matin_h_f81_old">matin_h_f81</a></h3>
        </div>
      </div>
  )
}

export default About