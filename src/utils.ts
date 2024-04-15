
export function composeEventHandlers<E>(
  userHandler?: (event: E) => void,
  libHandler?: (event: E) => void
) {
  return function handleEvent(event: E) {
    userHandler?.(event)

    // @ts-ignore
    if (!(event).defaultPrevented) {
      return libHandler?.(event)
    }
  };
}
