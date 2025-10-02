import type { PlayerStats } from './api'

const DB_NAME = 'marvel-rivals-cache'
const STORE_NAME = 'player-stats'
const CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 hours in milliseconds

interface CachedPlayer {
  uid: string
  data: PlayerStats
  timestamp: number
}

function openDB (): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.addEventListener('error', () => reject(request.error))
    request.addEventListener('success', () => resolve(request.result))

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'uid' })
      }
    }
  })
}

export async function getCachedPlayer (uid: string): Promise<PlayerStats | null> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.get(uid)

      request.addEventListener('error', () => reject(request.error))
      request.addEventListener('success', () => {
        const cached = request.result as CachedPlayer | undefined

        if (!cached) {
          resolve(null)
          return
        }

        // Check if cache is still valid
        const now = Date.now()
        if (now - cached.timestamp > CACHE_DURATION) {
          resolve(null)
          return
        }

        resolve(cached.data)
      })
    })
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

export async function setCachedPlayer (uid: string, data: PlayerStats): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const cached: CachedPlayer = {
      uid,
      data,
      timestamp: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const request = store.put(cached)
      request.addEventListener('error', () => reject(request.error))
      request.addEventListener('success', () => resolve())
    })
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}

export async function clearCache (): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.addEventListener('error', () => reject(request.error))
      request.addEventListener('success', () => resolve())
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}
