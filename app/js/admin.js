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
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =======================
// 🧠 PAGE DETECTION
// =======================
const page = document.body.dataset.page;
const collectionName = page;

// =======================
const table = document.getElementById("usersTable");
const modal = document.getElementById("userModal");
const saveBtn = document.getElementById("saveUser");
const addBtn = document.getElementById("addUserBtn");

const emailInput = document.getElementById("email");
const roleInput = document.getElementById("role");

let editId = null;
let currentUserRole = null;
let currentUserId = null;

// =======================
// 🔐 AUTH
// =======================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  currentUserId = user.uid;

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists()) return;

  currentUserRole = userSnap.data().role;

  if (!["admin", "superadmin"].includes(currentUserRole)) {
    window.location.href = "../index.html";
    return;
  }

  loadData();
});

// =======================
// 📥 LOAD DATA
// =======================
async function loadData() {
  table.innerHTML = "";

  const snap = await getDocs(collection(db, collectionName));

  snap.forEach(docSnap => {
    const data = docSnap.data();

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${formatData(data)}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;

    // EDIT
    row.querySelector(".edit-btn").onclick = () => {
      editId = docSnap.id;
      openModal(data);
    };

    // DELETE
    row.querySelector(".delete-btn").onclick = async () => {
      if (collectionName === "users") {
        if (docSnap.id === currentUserId) {
          alert("You cannot delete yourself");
          return;
        }

        if (data.role === "superadmin" && currentUserRole !== "superadmin") {
          alert("Only superadmin can delete superadmin");
          return;
        }
      }

      if (!confirm("Delete?")) return;

      await deleteDoc(doc(db, collectionName, docSnap.id));
      loadData();
    };

    table.appendChild(row);
  });
}

// =======================
// 🧠 FORMAT DISPLAY
// =======================
function formatData(data) {
  return Object.entries(data)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("<br>");
}

// =======================
// ➕ ADD
// =======================
addBtn.onclick = () => {
  editId = null;
  openModal({});
};

// =======================
// 💾 SAVE
// =======================
saveBtn.onclick = async () => {
  let data;

  try {
    data = JSON.parse(prompt("Enter JSON:", "{}"));
  } catch {
    alert("Invalid JSON");
    return;
  }

  if (editId) {
    await updateDoc(doc(db, collectionName, editId), data);
  } else {
    await addDoc(collection(db, collectionName), data);
  }

  modal.classList.remove("open");
  loadData();
};

// =======================
// 🧱 MODAL
// =======================
function openModal(data) {
  modal.classList.add("open");
}