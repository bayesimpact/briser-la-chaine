import {useCallback} from 'react'
import {useHistory, useRouteMatch} from 'react-router'


function maybeParseInt(value: string|undefined, maxNumber: number): number {
  const numValue = Number.parseInt(value || '0', 10)
  if (Number.isNaN(numValue)) {
    return 0
  }
  return Math.min(Math.max(numValue, 0), maxNumber)
}


interface StepRouteParams {
  step?: string
}


// A hook to use steps that can be navigated through the router.
function useRouteStepper(numSteps: number): [number, (step: number) => void] {
  const history = useHistory()
  const {path: route} = useRouteMatch()
  const setStep = useCallback((step: number): void => {
    history.push(`${route}/${step}`)
  }, [history, route])
  const match = useRouteMatch<StepRouteParams>(`${route}/:step?`)
  const step = maybeParseInt(match?.params.step, numSteps - 1)
  return [step, setStep]
}


export {useRouteStepper}
