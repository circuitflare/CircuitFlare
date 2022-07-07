import React, { useState, useEffect } from "react";
import "../styles/about.css";

const About = () => {
  const aboutCaption = String.raw`Hey there! If you made it till this page, chances are that you wanted to know more about us. 
Well, you have come to the right place. We are a startup based out of Hyderabad, India.`;

  const [usePreFormat, setUsePreFormat] = useState(true);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 820) {
        setUsePreFormat(false);
      } else {
        setUsePreFormat(true);
      }
    });

    return window.removeEventListener("resize", () => {});
  }, [window]);

  return (
    <div className="about_container">
      <h4 className="about_heading">About Us</h4>
      {usePreFormat ? (
        <pre className="about_caption">{aboutCaption}</pre>
      ) : (
        <h5 className="about_caption">
          Hey there! If you're reading this page, chances are that you wanted to
          know more about us. Well, you have come to the right place. We are a
          startup based out of Hyderabad, India.
        </h5>
      )}
    </div>
  );
};

export default About;
