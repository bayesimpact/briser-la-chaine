import {useLayoutEffect} from 'react'


function useBackgroundColor(color: undefined|string): void {
  useLayoutEffect((): (() => void) => {
    if (!color) {
      return (): void => void 0
    }
    const previousBackground = document.body.style.backgroundColor
    document.body.style.backgroundColor = color
    return (): void => {
      document.body.style.backgroundColor = previousBackground
    }
  }, [color])
}


export {useBackgroundColor}
