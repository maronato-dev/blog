import firebase from "firebase/app"
import "firebase/firestore"

const firebaseConfig = {
  projectId: "blog-beef8",
}

export const app = firebase.initializeApp(firebaseConfig)

export const db = app.firestore()
