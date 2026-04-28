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

onAuthStateChanged(auth, async (user) => {
  console.log("AUTH:", user);

  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists()) {
    console.log("User doc missing");
    return;
  }

  const role = userSnap.data().role;

  if (!["admin", "superadmin"].includes(role)) {
    window.location.href = "../index.html";
    return;
  }

  init();
});


function init() {
console.log("INIT RUNNING");
const page = document.body.dataset.page;

const table = document.getElementById("usersTable");
const modal = document.getElementById("userModal");
const saveBtn = document.getElementById("saveUser");
const addBtn = document.getElementById("addUserBtn");

let editId = null;


// LOAD DATA
// =======================
async function loadData() {
  try {
    console.log("LOADING DATA...");
    console.log("PAGE:", page);

    if (!page) {
      console.error("No page defined (data-page missing)");
      return;
    }

    if (!table) {
      console.error("Table element not found");
      return;
    }

    table.innerHTML = "";

    const snap = await getDocs(collection(db, page));

    console.log("DOC COUNT:", snap.size);

    snap.forEach(docSnap => {
      const data = docSnap.data();

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${renderRow(data)}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;

      row.querySelector(".edit-btn").onclick = () => {
        editId = docSnap.id;
        openModal(data);
      };

      row.querySelector(".delete-btn").onclick = async () => {
        if (!confirm("Delete?")) return;

        await deleteDoc(doc(db, page, docSnap.id));
        loadData();
      };

      table.appendChild(row);
    });

  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}

// DISPLAY FORMAT
// =======================
function renderRow(data) {
  if (page === "users") {
    return `${data.email} (${data.role})`;
  }

  if (page === "plants") {
    return `${data.metadata?.naziv || "-"} (${data.metadata?.sorta || "-"})`;
  }

  if (page === "entries") {
    return `${data.type || "-"} - ${data.note || "-"}`;
  }

  if (page === "tenants") {
    return `${data.naziv || "-"} (${data.status || "-"})`;
  }

  return JSON.stringify(data);
}


// ADD
// =======================
addBtn.onclick = () => {
  editId = null;
  openModal({});
};


// MODAL FORM
// =======================
function openModal(data) {
  modal.classList.add("open");

  modal.innerHTML = `
    <div class="modal-content">
      <h3>${editId ? "Edit" : "Add"} ${page}</h3>

      ${renderFormFields(data)}

      <button id="saveDynamic">Save</button>
    </div>
  `;

  document.getElementById("saveDynamic").onclick = async () => {
    const formData = getFormData();

    if (editId) {
      await updateDoc(doc(db, page, editId), formData);
    } else {
      await addDoc(collection(db, page), formData);
    }

    modal.classList.remove("open");
    loadData();
  };
}

// FORM FIELDS
// =======================
function renderFormFields(data) {

  if (page === "users") {
    return `
      <input id="email" value="${data.email || ""}" placeholder="Email"/>
      <select id="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="superadmin">Superadmin</option>
      </select>
    `;
  }

  if (page === "plants") {
    return `
      <input id="naziv" value="${data.metadata?.naziv || ""}" placeholder="Naziv"/>
      <input id="sorta" value="${data.metadata?.sorta || ""}" placeholder="Sorta"/>
      <input id="stage" value="${data.metadata?.stage || ""}" placeholder="Stage"/>
    `;
  }

  if (page === "entries") {
    return `
      <input id="type" value="${data.type || ""}" placeholder="Type"/>
      <input id="note" value="${data.note || ""}" placeholder="Note"/>
    `;
  }

  if (page === "tenants") {
    return `
      <input id="naziv" value="${data.naziv || ""}" placeholder="Naziv"/>
      <input id="status" value="${data.status || ""}" placeholder="Status"/>
    `;
  }

  return `<p>No form</p>`;
}

// GET FORM DATA
// =======================
function getFormData() {

  if (page === "users") {
    return {
      email: document.getElementById("email").value,
      role: document.getElementById("role").value,
      createdAt: new Date().toISOString()
    };
  }

  if (page === "plants") {
    return {
      metadata: {
        naziv: document.getElementById("naziv").value,
        sorta: document.getElementById("sorta").value,
        stage: document.getElementById("stage").value
      }
    };
  }

  if (page === "entries") {
    return {
      type: document.getElementById("type").value,
      note: document.getElementById("note").value
    };
  }

  if (page === "tenants") {
    return {
      naziv: document.getElementById("naziv").value,
      status: document.getElementById("status").value
    };
  }

  return {};
}

// =======================
loadData();
}