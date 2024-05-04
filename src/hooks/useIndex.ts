
export type useIndexType = (id: string) => number  // getIndex

export function useIndex(): useIndexType {
  let index = -1
  const descendantsMap: Record<string, number> = {}
  
  function getIndex(id: string) {
    if(descendantsMap[id] == undefined) {
      descendantsMap[id] = ++index
    }
    return descendantsMap[id]
  }

  return getIndex
}
