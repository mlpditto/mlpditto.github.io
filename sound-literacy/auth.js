// DigitalMindLab / Sound Literacy
// Free Authentication Foundation
// Uses Firebase Authentication (Google Sign-In)
// Add your Firebase config from Firebase Console before production use.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

let auth = null;
let provider = null;

function initAuth() {
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded');
    return;
  }

  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  provider = new firebase.auth.GoogleAuthProvider();

  auth.onAuthStateChanged(user => {
    updateUserUI(user);
  });
}

function signInGoogle() {
  if (!auth || !provider) {
    alert('Firebase ยังไม่ได้ตั้งค่า');
    return;
  }

  auth.signInWithPopup(provider)
    .then(result => {
      console.log('Login success', result.user);
      updateUserUI(result.user);
    })
    .catch(error => {
      console.error(error);
    });
}

function signOutUser() {
  if (auth) {
    auth.signOut();
  }
}

function updateUserUI(user) {
  const area = document.getElementById('user-area');
  if (!area) return;

  if (user) {
    area.innerHTML = `
      <div>👤 ${user.displayName || 'User'}</div>
      <button onclick="signOutUser()">Logout</button>
    `;
  } else {
    area.innerHTML = `
      <button onclick="signInGoogle()">🔐 Sign in with Google</button>
    `;
  }
}

document.addEventListener('DOMContentLoaded', initAuth);
