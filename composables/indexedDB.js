const listRequest = [];

export const config_IDB = {
  database: 'cromie',
  version: 2,
  store: {
    request: 'dialog-control',
  },
};

export const createIDBDatabase = async (database, version, objectStore) => {
  if (window.indexedDB) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(database, version);
      request.onupgradeneeded = (event) => {
        const connection = event.target.result;
        connection.createObjectStore(objectStore, {
          keyPath: 'id',
          autoIncrement: true,
        });
      };
      request.onsuccess = (event) => {
        console.log('Database opened successfully', event);
        resolve();
      };
      request.onerror = (event) => {
        console.log('Error opening database', event);
        reject(event.target.error);
      };
    });
  }
};

export const getAllIDBData = async (database, version, objectStore) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database, version);
    request.onsuccess = (event) => {
      const connection = event.target.result;
      const transaction = connection.transaction(objectStore, 'readonly');
      const store = transaction.objectStore(objectStore);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        if (getAllRequest.result) {
          listRequest = getAllRequest.result;
          listRequest.sort((a, b) => {
            if (a.created_at && b.created_at) {
              const dateA = new Date(a.created_at);
              const dateB = new Date(b.created_at);
              return dateB - dateA;
            }
          });
          resolve(listRequest);
        } else {
          reject(new Error('Failed to retrieve data from indexedDB'));
        }
      };

      getAllRequest.onerror = () => {
        reject(new Error('Failed to retrieve data from indexedDB'));
      };
    };

    request.onerror = () => {
      reject(new Error('Failed to open indexedDB'));
    };
  });
};

export const addIDBData = async (
  database,
  version,
  objectStore,
  item,
  quantity
) => {
  try {
    await this.getAllIDBData(database, version, objectStore);
    await this.limitListMaxItens(
      database,
      version,
      objectStore,
      item,
      quantity
    );
    const result = await listRequest.find(
      (listItem) => listItem.id === item.id
    );
    if (!result) {
      const request = indexedDB.open(database, version);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(objectStore, 'readwrite');
        const object = transaction.objectStore(objectStore);
        const payload = object.add(item);
        payload.onsuccess = (event) => {
          console.log('payload success', event);
        };
        payload.onerror = (event) => {
          console.log('Error opening payload', event);
        };
      };
    }
  } catch (error) {
    console.error(error);
  }
};

export const limitListMaxItens = async (
  database,
  version,
  objectStore,
  item,
  quantity
) => {
  const result = await listRequest.find((listItem) => listItem.id === item.id);
  if (result && listRequest.length == quantity) {
    return;
  }

  if (listRequest.length == quantity) {
    const lastItem = listRequest[listRequest.length - 1];
    await this.removeIDBData(database, version, objectStore, lastItem.id);
  }
};

export const removeIDBData = async (database, version, objectStore, id) => {
  try {
    await this.getAllIDBData(database, version, objectStore);
    const result = await listRequest.find((listItem) => listItem.id === id);
    if (result) {
      const request = indexedDB.open(database, version);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(objectStore, 'readwrite');
        const object = transaction.objectStore(objectStore);
        const payload = object.delete(id);
        payload.onsuccess = (event) => {
          console.log('payload success', event);
        };
        payload.onerror = (event) => {
          console.log('Error opening payload', event);
        };
      };
    }
  } catch (error) {
    console.error(error);
  }
};
