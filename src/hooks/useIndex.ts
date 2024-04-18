import { useCallback, useRef } from "react"

export type useIndexType = (id: string) => number  // getIndex

export function useIndex(): useIndexType {
  const index = useRef(-1)
  const descendantsMap = useRef<Record<string, number>>({})
  
  const getIndex = useCallback((id: string) => {
    if(descendantsMap.current[id] == undefined) {
      descendantsMap.current[id] = ++index.current
    }
    return descendantsMap.current[id]
  }, [])

  return getIndex
}