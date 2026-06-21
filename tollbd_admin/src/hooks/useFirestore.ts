import { useEffect, useState } from 'react'
import {
  Query,
  QueryDocumentSnapshot,
  onSnapshot,
  CollectionReference,
} from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'

type SnapshotSource = Query<DocumentData> | CollectionReference<DocumentData>

type UseFirestoreState<T> = {
  data: T[]
  loading: boolean
  error: string | null
}

export function useFirestoreCollection<T>(
  source: SnapshotSource,
  mapDoc: (doc: QueryDocumentSnapshot<DocumentData>) => T,
): UseFirestoreState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsub = onSnapshot(
      source,
      (snapshot) => {
        setData(snapshot.docs.map(mapDoc))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsub()
  }, [source, mapDoc])

  return { data, loading, error }
}
