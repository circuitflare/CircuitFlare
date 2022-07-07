import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBFdLM3cvR5jDL_DKjsFziAwb6ks8ylq7A",
  authDomain: "circuit-flare-5.firebaseapp.com",
  projectId: "circuit-flare-5",
  storageBucket: "circuit-flare-5.appspot.com",
  messagingSenderId: "142147516624",
  appId: "1:142147516624:web:ff02e72bf0281268cf46d5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();


