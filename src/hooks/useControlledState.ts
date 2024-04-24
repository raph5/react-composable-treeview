import React, { useState } from "react"

export type useControlledStateHook<T> = [
  T,                                        // state
  React.Dispatch<React.SetStateAction<T>>,  // setState
]

export function useControlledState<T>(controlledValue?: T, onChange?: (v: T) => void, defaultValue?: T): useControlledStateHook<T> {
  const [stateValue, setStateValue] = useState(defaultValue as T)
  const effectiveValue = controlledValue !== undefined ? controlledValue : stateValue

  const setState: React.Dispatch<React.SetStateAction<T>> = (nextState) => {
    // c.f. this issue
    // https://github.com/microsoft/TypeScript/issues/37663
    // @ts-ignore
    const nextValue: T = typeof nextState == 'function' ? nextState(stateValue) : nextState

    if(onChange) {
      onChange(nextValue)
    }
    setStateValue(nextValue)
  }

  return [effectiveValue, setState]
}
