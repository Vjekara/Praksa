console.log("START");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyB-3wuIEOqpnnAqWiBYuSTEp1is_n76DEg",
  authDomain: "balpha-9dab9.firebaseapp.com",
  databaseURL: "https://balpha-9dab9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "balpha-9dab9",
  storageBucket: "balpha-9dab9.firebasestorage.app",
  messagingSenderId: "398537397385",
  appId: "1:398537397385:web:9bd3aec82f44ddec20e258",
  measurementId: "G-HLXHTQP41H"

};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Fetching users...");

  const snap = await getDocs(collection(db, "users"));

  console.log("RESULT:", snap.size);

  const appDiv = document.getElementById("app");

  snap.forEach(d => {
    const div = document.createElement("div");
    div.textContent = JSON.stringify(d.data());
    appDiv.appendChild(div);
  });
}

test();