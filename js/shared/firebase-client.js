let firebaseAppPromise;
let firebaseAuthPromise;
let firebaseAuthModulePromise;
let firebaseAuthPersistencePromise;
let firebaseFirestorePromise;
let firebaseFirestoreModulePromise;

async function loadFirebaseAppModule() {
  const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js');

  return { initializeApp, getApps };
}

async function loadFirebaseAuthModule() {
  if (!firebaseAuthModulePromise) {
    firebaseAuthModulePromise = import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
  }

  return firebaseAuthModulePromise;
}

async function loadFirebaseFirestoreModule() {
  if (!firebaseFirestoreModulePromise) {
    firebaseFirestoreModulePromise = import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
  }

  return firebaseFirestoreModulePromise;
}

export async function getFirebaseApp() {
  if (!firebaseAppPromise) {
    firebaseAppPromise = (async () => {
      let configModule;

      try {
        configModule = await import('./firebase-config.js');
      } catch {
        return null;
      }

      const config = configModule?.firebaseWebConfig;
      if (!config?.projectId || !config?.appId || !config?.apiKey) {
        return null;
      }

      const { initializeApp, getApps } = await loadFirebaseAppModule();
      return getApps()[0] ?? initializeApp(config);
    })();
  }

  return firebaseAppPromise;
}

export async function getFirebaseAuth() {
  if (!firebaseAuthPromise) {
    firebaseAuthPromise = (async () => {
      const app = await getFirebaseApp();
      if (!app) return null;

      const { getAuth, setPersistence, browserLocalPersistence } = await loadFirebaseAuthModule();
      const auth = getAuth(app);

      if (!firebaseAuthPersistencePromise) {
        firebaseAuthPersistencePromise = setPersistence(auth, browserLocalPersistence).catch(() => {});
      }

      await firebaseAuthPersistencePromise;
      return auth;
    })();
  }

  return firebaseAuthPromise;
}

export async function getFirebaseAuthModule() {
  const app = await getFirebaseApp();
  if (!app) return null;

  return loadFirebaseAuthModule();
}

export async function getFirebaseFirestore() {
  if (!firebaseFirestorePromise) {
    firebaseFirestorePromise = (async () => {
      const app = await getFirebaseApp();
      if (!app) return null;

      const { getFirestore } = await loadFirebaseFirestoreModule();
      return getFirestore(app);
    })();
  }

  return firebaseFirestorePromise;
}

export async function getFirebaseFirestoreModule() {
  const app = await getFirebaseApp();
  if (!app) return null;

  return loadFirebaseFirestoreModule();
}
