import axios from "axios";

export const registerUser = async (user) => {
  return await axios.post("/api/user/register", user, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const loginUser = async (user) => {
  return await axios.post("/api/user/login", user, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const loggedInUser = async() => {
  return await axios.get("/api/user/me");
}

export const logoutUser = async (user) => {
  return await axios.get("/api/user/logout");
};

export const forgotUnP = async (email, forgotValue) => {
  if (forgotValue === "password") {

    return await axios.post("/api/user/password/forgot", {email}, {
      headers: {
        "Content-Type": "application/json",
      },
    });

  } else {
    return await axios.post("/api/user/username/forgot", {email}, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const resetUnP = async (inputVal, confirmInputVal, forgotValue,token) => {
  if (forgotValue === "password") {
    return await axios.put(`/api/user/password/reset/${token}`, {password:inputVal, confirmPassword:confirmInputVal}, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return await axios.put(`/api/user/username/reset/${token}`, {username:inputVal, confirmUsername:confirmInputVal}, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const createOrder = async(orderData) => {
  return await axios.post("/api/order/create/order", orderData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const getUserOrders = async() =>{
  return await axios.get("/api/order/get/user/orders");
}

export const changePw = async (passwords) => {
  return await axios.put("/api/user/me/update_password", passwords, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/* admin apis */

export const adminLogin = async(userData) => {
  return await axios.post("/api/admin/login", userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const adminOrders = async() => {
  return await axios.get("/api/admin/orders")
}

export const adminForgotPw = async() => {
  return await axios.get("/api/admin/forgot/password")
}

export const adminResetPw = async(inputVal, confirmInputVal,token) => {
  return await axios.put(`/api/admin/reset/password/${token}` ,{password:inputVal, confirmPassword:confirmInputVal}, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
