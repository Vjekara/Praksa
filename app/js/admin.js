console.log("START");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getAuth,
  onAuthStateChanged,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth(app);


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


const table = document.getElementById("usersTable");
const modal = document.getElementById("userModal");
const saveBtn = document.getElementById("saveUser");
const addBtn = document.getElementById("addUserBtn");

const emailInput = document.getElementById("email");
const roleInput = document.getElementById("role");

let editId = null;

// LOAD USERS
async function loadUsers() {
  table.innerHTML = "";

  const snap = await getDocs(collection(db, "users"));

  snap.forEach(docSnap => {
    const data = docSnap.data();

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.email || "-"}</td>
      <td>${data.role || "-"}</td>
      <td>${data.createdAt || "-"}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;

    // EDIT
    row.querySelector(".edit-btn").onclick = () => {
      editId = docSnap.id;
      emailInput.value = data.email || "";
      roleInput.value = data.role || "user";
      modal.classList.add("open");
    };

    // DELETE
    row.querySelector(".delete-btn").onclick = async () => {
      if (!confirm("Delete user?")) return;

      await deleteDoc(doc(db, "users", docSnap.id));
      loadUsers();
    };

    table.appendChild(row);
  });
}

// OPEN ADD MODAL
addBtn.onclick = () => {
  editId = null;
  emailInput.value = "";
  roleInput.value = "user";
  modal.classList.add("open");
};

// SAVE USER
saveBtn.onclick = async () => {
  const data = {
    email: emailInput.value,
    role: roleInput.value,
    createdAt: new Date().toISOString()
  };

  if (editId) {
    await updateDoc(doc(db, "users", editId), data);
  } else {
    await addDoc(collection(db, "users"), data);
  }

  modal.classList.remove("open");
  loadUsers();
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists()) {
    window.location.href = "../index.html";
    return;
  }

  const role = userSnap.data().role;

  if (!["admin", "superadmin"].includes(role)) {
    window.location.href = "../index.html";
    return;
  }
  loadUsers();
});