const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createViewer() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, 'viewer@spmiasacademy.com', 'Viewer123!Secure');
    console.log("Successfully created new viewer user:", userCredential.user.uid);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("Viewer user already exists!");
    } else {
      console.error("Error creating user:", error.message);
    }
  }
  process.exit();
}

createViewer();
