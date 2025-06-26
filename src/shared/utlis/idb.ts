export async function deletepdf(key?: string) {
    const db = await openDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    let req: IDBRequest
    if (key) {
      req = store.delete(key)
    } else {
      req = store.clear()
    }
  
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        resolve(req.result)
      }
      req.onerror = () => {
        reject(req.error)
      }
    })
  }
  
  const dbName = 'pdf'
  const storeName = 'pdfs'
  
  const openDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1)
      request.onerror = () => {
        reject(request.error)
      }
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'key' })
        }
      }
    })
  }
  
  // Set data in IndexedDB
  export const savePdf = async (
    key: string,
    data: Blob,
  ): Promise<void> => {
    const db = await openDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    store.put({ key, data })
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve()
      }
      transaction.onerror = () => {
        reject(transaction.error)
      }
    })
  }
  
  // Get data from IndexedDB
  export const getPdf = async (key: string): Promise<Blob> => {
    const db = await openDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null)
      }
      request.onerror = () => {
        reject(request.error)
      }
    })
  }
  