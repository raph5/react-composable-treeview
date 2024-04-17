import { useCallback, useRef } from "react"

export type useIndexType = () => number  // getIndex

export function useIndex(): useIndexType {
  const index = useRef(-1)
  const getIndex = useCallback(() => ++index.current, [])

  return getIndex
}