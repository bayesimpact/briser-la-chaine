import {useCallback, useEffect} from 'react'


type EventType = 'keydown' | 'keyup'

// Stacks of short key listeners. The ones entered last are tried first.
const keyListenerStack: {[K in EventType]: ((event: KeyboardEvent) => boolean)[]} =
  {keydown: [], keyup: []}

// Trigger all listeners in the stack until one returns false.
const handleKeyEvent = (eventType: EventType): ((event: KeyboardEvent) => void) =>
  (event: KeyboardEvent): void => {
    for (const handler of keyListenerStack[eventType]) {
      if (!handler(event)) {
        return
      }
    }
  }
const handleKeyEvents = {
  keydown: handleKeyEvent('keydown'),
  keyup: handleKeyEvent('keyup'),
} as const


interface KeyModifier {
  ctrl?: boolean
  shift?: boolean
}


// Add a listener for a key event.
// The callback action may return true if it didn't do anything and wants to let other key listeners
// get a change to use the event.
function useKeyListener(
  keyCode: string, action?: () => (boolean|undefined|void), modifiers?: KeyModifier,
  type: EventType = 'keyup',
): void {

  const {ctrl = false, shift = false} = modifiers || {}

  const listener = useCallback((event: KeyboardEvent): boolean => {
    if (event.code === keyCode && event.ctrlKey === ctrl && event.shiftKey === shift) {
      if (!action) {
        return true
      }
      return !!action()
    }
    return true
  }, [keyCode, ctrl, shift, action])

  useEffect((): (() => void) => {
    if (!action) {
      return (): void => void 0
    }
    if (keyListenerStack[type].unshift(listener) === 1) {
      document.addEventListener(type, handleKeyEvents[type], false)
    }

    return (): void => {
      keyListenerStack[type].splice(keyListenerStack[type].indexOf(listener), 1)
      if (!keyListenerStack[type].length) {
        document.removeEventListener(type, handleKeyEvents[type], false)
      }
    }
  }, [action, listener, type])
}


export {useKeyListener}
