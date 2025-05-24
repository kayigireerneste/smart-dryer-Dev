"use client"

import { useState, useEffect } from "react"

type FetchFunction<T> = () => Promise<T>

export function useRealTimeData<T>(fetchFn: FetchFunction<T>, initialData: T, interval = 5000) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout

    const fetchData = async () => {
      if (!isMounted) return

      setIsLoading(true)
      try {
        const result = await fetchFn()
        if (isMounted) {
          setData(result)
          setLastUpdated(new Date())
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("An error occurred"))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Fetch immediately
    fetchData()

    // Then set up interval
    intervalId = setInterval(fetchData, interval)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [fetchFn, interval])

  const refetch = async () => {
    setIsLoading(true)
    try {
      const result = await fetchFn()
      setData(result)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"))
    } finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, lastUpdated, refetch }
}
