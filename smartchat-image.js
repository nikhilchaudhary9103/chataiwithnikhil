// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgD17HehIZ3RXWy9B6RbYT2Bl4HTZZzfI",
  authDomain: "cloudstorage-bf72f.firebaseapp.com",
  databaseURL: "https://cloudstorage-bf72f-default-rtdb.firebaseio.com",
  projectId: "cloudstorage-bf72f",
  storageBucket: "cloudstorage-bf72f.appspot.com",
  messagingSenderId: "240415341844",
  appId: "1:240415341844:web:e508a987cbbea4dcf01601",
  measurementId: "G-E49R91SPL9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

// Show message
function showMessage(msg, type) {
  const p = document.createElement("p");
  p.className = type;
  p.innerText = msg;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

// Show image
function showImage(url) {
  const img = document.createElement("img");
  img.src = url;
  img.className = "image";
  chat.appendChild(img);
  chat.scrollTop = chat.scrollHeight;
}

// Wikipedia
async function getWikipediaSummary(query) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.extract || null;
  } catch {
    return null;
  }
}

// Image suggest
async function getImageUrl(query) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&t=chatgpt`);
    const data = await res.json();
    if (data.Image && data.Image !== "") {
      return data.Image;
    } else {
      // fallback image
      return `https://source.unsplash.com/400x200/?${encodeURIComponent(query)}`;
    }
  } catch {
    return null;
  }
}

// Firebase reply
async function getReply(msg) {
  const snapshot = await get(child(ref(db), "chatbot/" + msg));
  return snapshot.exists() ? snapshot.val() : null;
}

// Firebase save
async function saveReply(msg, reply) {
  await set(ref(db, "chatbot/" + msg), reply);
}

// Main
sendBtn.addEventListener("click", async () => {
  const msg = input.value.trim().toLowerCase();
  if (!msg) return;
  showMessage(msg, "user");

  let reply = await getReply(msg);
  if (!reply) {
    reply = await getWikipediaSummary(msg);
    if (reply) await saveReply(msg, reply);
    else {
      reply = prompt("Iska reply mujhe nahi pata. Sikhao?");
      if (reply) await saveReply(msg, reply);
    }
  }

  if (reply) {
    showMessage(reply, "bot");

    // Show related image
    const img = await getImageUrl(msg);
    if (img) showImage(img);
  }

  input.value = "";
});
