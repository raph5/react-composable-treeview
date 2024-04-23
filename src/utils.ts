// @ts-nocheck

export function composeEventHandlers<E>(
  userHandler?: (event: E) => void,
  libHandler?: (event: E) => void
) {
  return function handleEvent(event: E) {
    const prevented = event.defaultPrevented
    if(prevented) {
      event.defaultPrevented = false
    }

    userHandler?.(event)

    let returnValue
    if (!event.defaultPrevented) {
      returnValue = libHandler?.(event)

      if(prevented) {
        event.defaultPrevented = true
      }
    }

    return returnValue
  }
}
