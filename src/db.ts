const DB_NAME = 'PlayerDB';
const STORE_NAME = 'media';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// No seu db.ts (ou onde estiver a lógica do IndexedDB)
export const salvarNoDB = async (name: string, blob: Blob, thumbnail?: string) => {
  const db = await initDB(); 
  const tx = db.transaction('media', 'readwrite');
  const store = tx.objectStore('media');
  
  // Aqui salvamos o objeto completo
  await store.put({ 
    name, 
    blob, 
    thumbnail // <--- O banco precisa gravar isso
  });
};

export const buscarTodosDoDB = async (): Promise<{ name: string, blob: Blob, thumbnail?: string }[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

export const deletarDoDB = async (name: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(name);
};