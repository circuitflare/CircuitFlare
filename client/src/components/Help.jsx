import React, { useState, useEffect } from "react";
import "../styles/help.css";
import {useNavigate} from 'react-router-dom'

const Help = () => {
  const helpCaption = String.raw`Got stuck? Have some questions for us? or Just wanted to say hello? Reach out to us by any of the following 

WhatsApp 
Email 
Phone`;

  const [usePreFormat, setUsePreFormat] = useState(true);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 940) {
        setUsePreFormat(false);
      } else {
        setUsePreFormat(true);
      }
    });

    return window.removeEventListener("resize", () => {});
  }, [window]);

  const navigate = useNavigate()

  return (
    <div className="help_container">
      <h4 className="help_heading">Help</h4>
      {usePreFormat ? (
        <pre className="help_caption">{helpCaption}</pre>
      ) : (
        <h5 className="help_caption">
          Got stuck? Have some questions for us? or Just wanted to say hello?
          Reach out to us by any of the following <br/><br/>WhatsApp <br/>Email <br/>Phone
        </h5>
      )}
      <h6 className="help_TC" onClick={() => navigate('/T&C')}>View Terms & Conditions and Privacy Policy</h6>
    </div>
  );
};

export default Help;
