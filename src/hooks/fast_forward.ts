import {useCallback, useEffect} from 'react'
import {useHistory} from 'react-router-dom'

import {useKeyListener} from 'hooks/shortkey'


const maxDurationBetweenClickInARowMillisec = 500
const minClicksInARow = 8
const swipeMaxDurationMillisec = 400
const horizontalSwipeMaxYDelta = 100
const horizontalSwipeMinXDelta = 150


let mobileListener: MobileFastForwardListener|undefined


// A listener for mobile fast forward:
// - it first listens for 5 clicks in a row to enable mobile fast-forwarding, then
// - trigger fast-forward action on left swipes.
class MobileFastForwardListener {

  public constructor() {
    this.lastClickTime = 0
    this.forwardHandlers = []
    document.addEventListener('touchstart', this.countClicksInARow)
  }

  private endTouch: {
    readonly x: number
    readonly y: number
  } | undefined

  private forwardHandlers: ForwardFunc[]

  private lastClickTime: number

  private numClicksInARow = 0

  private startTouch: {
    readonly time: number
    readonly x: number
    readonly y: number
  } | undefined

  private countClicksInARow = (): void => {
    const time = new Date().getTime()
    if (!this.lastClickTime || time > this.lastClickTime + maxDurationBetweenClickInARowMillisec) {
      this.numClicksInARow = 1
    } else {
      this.numClicksInARow += 1
      if (this.numClicksInARow >= minClicksInARow) {
        document.removeEventListener('touchstart', this.countClicksInARow)
        this.startTouchListening()
      }
    }
    this.lastClickTime = time
  }

  private startTouchListening(): void {
    alert('Fast-Forward enabled')
    document.addEventListener('touchstart', this.handleTouchStart)
    document.addEventListener('touchmove', this.handleTouchMove)
    document.addEventListener('touchend', this.handleTouchEnd)
  }

  private handleTouchStart = ({touches}: TouchEvent): void => {
    if (touches.length !== 1) {
      this.startTouch = undefined
      return
    }
    this.startTouch = {
      time: new Date().getTime(),
      x: touches[0].pageX,
      y: touches[0].pageY,
    }
    this.endTouch = undefined
  }

  private handleTouchMove = ({touches}: TouchEvent): void => {
    if (touches.length !== 1) {
      return
    }
    this.endTouch = {
      x: touches[0].pageX,
      y: touches[0].pageY,
    }
  }

  private handleTouchEnd = (): void => {
    if (!this.endTouch || !this.startTouch) {
      this.startTouch = undefined
      this.endTouch = undefined
      return
    }
    const {time, x, y} = this.startTouch
    if (!time || new Date().getTime() > time + swipeMaxDurationMillisec) {
      return
    }
    const {x: endX, y: endY} = this.endTouch
    if (Math.abs(y - endY) >= horizontalSwipeMaxYDelta) {
      return
    }
    if (!endX || endX >= x - horizontalSwipeMinXDelta) {
      return
    }
    this.forwardHandlers.some(handler => {
      return handler && !handler()
    })
  }

  public add(handler: ForwardFunc): void {
    this.forwardHandlers.unshift(handler)
  }

  public remove(handler: ForwardFunc): void {
    const handlerIndex = this.forwardHandlers.findIndex((h): boolean => h === handler)
    if (handlerIndex >= 0) {
      this.forwardHandlers.splice(handlerIndex, 1)
    }
  }
}


export type ForwardFunc = () => boolean|undefined|void


/*
 * A Fast-forward hook: execute an imperative action on ctrl + shift + F.
 * On mobile, it uses the MobileFastForwardListener.
 *
 * Parameters:
 *  - onForward: a callback function to call when the a fast-forward is required.
 *  - dependencies: a list of dependencies to update the memoized version of `onForward`.
 *      If this list is not empty, this assumes that all dependencies for `onForward` are listed.
 *  - to: a route (as a string) to go to when a fast-forward is required.
 *      WARNING: switching dynamically from `onForward` to `to` is not very well handled yet.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useFastForward = (onForward?: ForwardFunc, dependencies: readonly any[] = [], to?: string):
void => {
  const history = useHistory()
  const handleForward = useCallback((): boolean|undefined|void => {
    const mayUseAnotherForward = onForward ? onForward() : true
    to && history.push(to)
    if (!to && mayUseAnotherForward) {
      return true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, history, to, dependencies.length || onForward])
  useKeyListener('KeyF', handleForward, {ctrl: true, shift: true})
  useEffect((): void|(() => void) => {
    if (!mobileListener) {
      mobileListener = new MobileFastForwardListener()
    }
    mobileListener.add(handleForward)
    return (): void => {
      if (mobileListener) {
        mobileListener.remove(handleForward)
      }
    }
  }, [handleForward])
}


export {useFastForward}
