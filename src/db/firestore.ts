import firebase from "firebase/app"
import "firebase/firestore"

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

export const app = firebase.initializeApp(firebaseConfig)

export const db = app.firestore()
