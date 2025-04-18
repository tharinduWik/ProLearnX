import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Updated Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJBG6tKmmF9ftWQktJSP_O15zRMeGkA_w",
    authDomain: "vehicle-service-manageme-4a48d.firebaseapp.com",
    projectId: "vehicle-service-manageme-4a48d",
    storageBucket: "vehicle-service-manageme-4a48d.appspot.com",
    messagingSenderId: "1038146211943",
    appId: "1:1038146211943:web:98ae1fa96f567f906e44c2",
    measurementId: "G-HJ0TSKDJ7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { firebaseConfig };
export default app;