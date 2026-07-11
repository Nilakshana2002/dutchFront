import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAzkGlzcBjdYrw4e9Wr2JHjOwqOp6_n3D8',
  authDomain: 'dutchpoint-6a316.firebaseapp.com',
  projectId: 'dutchpoint-6a316',
  storageBucket: 'dutchpoint-6a316.firebasestorage.app',
  messagingSenderId: '290402881028',
  appId: '1:290402881028:web:8437b2b57cee30d4b42f51',
  measurementId: 'G-DWEBSP1CXY',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };
