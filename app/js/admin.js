import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
addDoc,
deleteDoc,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔧 USE SAME CONFIG AS YOUR app.js
const firebaseConfig = {
// paste your firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const collections = [
"users",
"plants",
"entries",
"tenants",
"assets",
"audit_logs",
"toolbox"
];

// 🔐 CHECK ROLE
onAuthStateChanged(auth, async (user) => {
if (!user) {
window.location.href = "../index.html";
return;
}

const usersSnap = await getDocs(collection(db, "users"));
let currentUser = null;

usersSnap.forEach(d => {
if (d.data().uId == user.uid) {
currentUser = d.data();
}
});

if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
window.location.href = "../index.html";
return;
}

loadData();
});

// 📥 LOAD ALL COLLECTIONS
async function loadData() {
const appDiv = document.getElementById("app");
appDiv.innerHTML = "";

for (let colName of collections) {
const snap = await getDocs(collection(db, colName));

```
const section = document.createElement("div");
section.className = "section";

const title = document.createElement("h2");
title.textContent = colName;

const addBtn = document.createElement("button");
addBtn.textContent = "➕ Add";
addBtn.className = "add-btn";
addBtn.onclick = () => createDoc(colName);

section.appendChild(title);
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
  editBtn.onclick = () => editDoc(colName, d.id, data);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = () => deleteDocById(colName, d.id);

  card.appendChild(pre);
  card.appendChild(editBtn);
  card.appendChild(deleteBtn);

  section.appendChild(card);
});

appDiv.appendChild(section);
```

}
}

// ➕ CREATE
async function createDoc(col) {
const input = prompt("Enter JSON:");

if (!input) return;

try {
const data = JSON.parse(input);
await addDoc(collection(db, col), data);
alert("Created!");
loadData();
} catch {
alert("Invalid JSON");
}
}

// ✏️ EDIT
async function editDoc(col, id, oldData) {
const input = prompt("Edit JSON:", JSON.stringify(oldData, null, 2));

if (!input) return;

try {
const updated = JSON.parse(input);
await updateDoc(doc(db, col, id), updated);
alert("Updated!");
loadData();
} catch {
alert("Invalid JSON");
}
}

// 🗑 DELETE
async function deleteDocById(col, id) {
if (!confirm("Delete this document?")) return;

await deleteDoc(doc(db, col, id));
alert("Deleted!");
loadData();
}
