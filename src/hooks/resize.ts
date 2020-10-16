import {useCallback, useEffect, useState} from 'react'

const useWindowHeight = (): number => {
  const [height, setHeight] = useState(window.innerHeight)
  const updateHeight = useCallback(() => setHeight(window.innerHeight), [])
  useEffect((): (() => void) => {
    addEventListener('resize', updateHeight)
    return (): void => removeEventListener('resize', updateHeight)
  }, [updateHeight])
  return height
}

export {useWindowHeight}
