import type React from "react";
import { useCallback } from "react";

type Ref<T> = React.RefCallback<T> | React.RefObject<T> | null;

export type useComposedRefsType<T> = Ref<T>

export function useComposedRefs<T>(...refs: Ref<T>[]): useComposedRefsType<T> {
  
  return useCallback((node: T) => {
    for(const ref of refs) {
      if(typeof ref == "function") {
        ref(node)
      }
      else if(ref != null) {
        // @ts-ignore
        ref.current = node
      }
    }
  }, [refs])

}