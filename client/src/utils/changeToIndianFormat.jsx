export const changeToIndianFormat = (value) => {
    let str = String(value)

  str = str.split(".");
  
  return str[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,") + (str[1] ? "." + str[1] : "")

};

