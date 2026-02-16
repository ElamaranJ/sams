import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsKFqmEOUDjrTAJZe4nSD93aIhTKrADV4",
  authDomain: "sams-b26f6.firebaseapp.com",
  projectId: "sams-b26f6",
  storageBucket: "sams-b26f6.firebasestorage.app",
  messagingSenderId: "742315930377",
  appId: "1:742315930377:web:a98c1cb3639def0c0d99d8",
  measurementId: "G-HQ7GDEGVDC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: userData.name,
      role: userData.role,
      department: userData.department || '',
      studentId: userData.studentId || '',
      createdAt: new Date().toISOString(),
    });
    console.log("User registered successfully!");
    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error.message);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { success: true, user: { ...userData, uid: user.uid } };
    } else {
      return { success: false, error: "User data not found" };
    }
  } catch (error) {
    console.error("Login error:", error.message);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { success: true, userData: { ...userDoc.data(), uid } };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;