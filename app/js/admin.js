import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔧 YOUR CONFIG
const firebaseConfig = {
  // your config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const COLLECTION = "users";

// 🔐 AUTH + ROLE CHECK
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

// 📥 LOAD USERS
async function loadUsers() {
  const appDiv = document.getElementById("app");
  appDiv.innerHTML = "";

  const snap = await getDocs(collection(db, COLLECTION));

  const section = document.createElement("div");
  section.className = "section";

  const addBtn = document.createElement("button");
  addBtn.textContent = "➕ Add User";
  addBtn.className = "add-btn";
  addBtn.onclick = createUser;

  section.appendChild(addBtn);

  snap.forEach(d => {
    const data = d.data();

    const card = document.createElement("div");
    card.className = "card";

    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(data, null, 2);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => editUser(d.id, data);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteUser(d.id);

    card.appendChild(pre);
    card.appendChild(editBtn);
    card.appendChild(deleteBtn);

    section.appendChild(card);
  });

  appDiv.appendChild(section);
}

// ➕ CREATE
async function createUser() {
  const input = prompt("Enter user JSON:");

  if (!input) return;

  try {
    const data = JSON.parse(input);
    await addDoc(collection(db, COLLECTION), data);
    alert("User created");
    loadUsers();
  } catch {
    alert("Invalid JSON");
  }
}

// ✏️ EDIT
async function editUser(id, oldData) {
  const input = prompt("Edit JSON:", JSON.stringify(oldData, null, 2));

  if (!input) return;

  try {
    const updated = JSON.parse(input);
    await updateDoc(doc(db, COLLECTION, id), updated);
    alert("Updated");
    loadUsers();
  } catch {
    alert("Invalid JSON");
  }
}

// 🗑 DELETE
async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  await deleteDoc(doc(db, COLLECTION, id));
  alert("Deleted");
  loadUsers();
}