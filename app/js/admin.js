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

const firebaseConfig = {
  apiKey: "AIzaSyB-3wuIEOqpnnAqWiBYuSTEp1is_n76DEg",
  authDomain: "balpha-9dab9.firebaseapp.com",
  projectId: "balpha-9dab9",
  storageBucket: "balpha-9dab9.appspot.com",
  messagingSenderId: "398537397385",
  appId: "1:398537397385:web:9bd3aec82f44ddec20e258"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =======================
// UI ELEMENTS
// =======================
const table = document.getElementById("usersTable");
const modal = document.getElementById("userModal");
const saveBtn = document.getElementById("saveUser");
const addBtn = document.getElementById("addUserBtn");

const emailInput = document.getElementById("email");
const roleInput = document.getElementById("role");

// ➕ ADD FILTER DROPDOWN (auto)
const filter = document.createElement("select");
filter.innerHTML = `
  <option value="all">All</option>
  <option value="user">Users</option>
  <option value="admin">Admins</option>
  <option value="superadmin">Superadmins</option>
`;
filter.style.marginLeft = "10px";
addBtn.parentNode.appendChild(filter);

// =======================
let editId = null;
let currentUserRole = null;
let currentUserId = null;

// =======================
// AUTH + ROLE CHECK
// =======================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  currentUserId = user.uid;

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists()) {
    alert("User doc missing");
    return;
  }

  currentUserRole = userSnap.data().role;

  if (!["admin", "superadmin"].includes(currentUserRole)) {
    window.location.href = "../index.html";
    return;
  }

  loadUsers();
});

// =======================
// LOAD USERS
// =======================
async function loadUsers() {
  table.innerHTML = "";

  const snap = await getDocs(collection(db, "users"));

  snap.forEach(docSnap => {
    const data = docSnap.data();

    // FILTER
    if (filter.value !== "all" && data.role !== filter.value) return;

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

      // ❌ PREVENT DELETING YOURSELF
      if (docSnap.id === currentUserId) {
        alert("You cannot delete yourself.");
        return;
      }

      // PROTECT SUPERADMIN
      if (data.role === "superadmin" && currentUserRole !== "superadmin") {
        alert("Only superadmin can delete another superadmin.");
        return;
      }

      if (!confirm("Delete user?")) return;

      await deleteDoc(doc(db, "users", docSnap.id));
      loadUsers();
    };

    table.appendChild(row);
  });
}

// ADD USER
// =======================
addBtn.onclick = () => {
  editId = null;
  emailInput.value = "";
  roleInput.value = "user";
  modal.classList.add("open");
};


// SAVE USER
// =======================
saveBtn.onclick = async () => {
  const data = {
    email: emailInput.value,
    role: roleInput.value,
    createdAt: new Date().toISOString()
  };

  // 🔐 PROTECT SUPERADMIN EDIT
  if (editId) {
    const oldSnap = await getDoc(doc(db, "users", editId));
    const oldRole = oldSnap.data().role;

    if (oldRole === "superadmin" && currentUserRole !== "superadmin") {
      alert("Only superadmin can edit another superadmin.");
      return;
    }
  }

  if (editId) {
    await updateDoc(doc(db, "users", editId), data);
  } else {
    await addDoc(collection(db, "users"), data);
  }

  modal.classList.remove("open");
  loadUsers();
};


// FILTER CHANGE
filter.onchange = () => loadUsers();