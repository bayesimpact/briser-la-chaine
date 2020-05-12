import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react'

type HTMLInputElementProps = React.HTMLProps<HTMLInputElement>
export interface InputProps
  extends Pick<HTMLInputElementProps, Exclude<keyof HTMLInputElementProps, 'onChange' | 'ref'>> {
  applyFunc?: (inputValue: string) => string
  onChange?: (inputValue: string) => void
  // If this is set to a non-zero value, the components will wait the given amount of time before
  // calling onChange, to avoid calling it for each key pressed. It also calls it on blur events
  // and at unmount.
  onChangeDelayMillisecs?: number
  // If onChangeDelayMillisecs is set, this is called everytime the editable value changes,
  // without waiting for any delay.
  onEdit?: (inputValue: string) => void
  shouldFocusOnMount?: boolean
  value?: string
}


// TODO(cyrille): Set pseudo-element styles using Radium, rather than App.css.
const Input = (props: InputProps, ref: React.Ref<Inputable>): React.ReactElement => {
  const {applyFunc, onBlur, onChange, onChangeDelayMillisecs, onEdit, shouldFocusOnMount, style,
    value: propValue, ...otherProps} = props
  const dom = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, (): Inputable => ({
    blur: (): void => dom.current?.blur(),
    focus: (): void => dom.current?.focus(),
    select: (): void => dom.current?.select(),
  }))

  // TODO(cyrille): Check behaviour when isDelayed changes.
  const isDelayed = !!onChangeDelayMillisecs

  const [lastChangedValue, setLastChangedValue] = useState(propValue || '')
  const [stateValue, setStateValue] = useState(propValue || '')

  useEffect((): void => {
    if (!isDelayed) {
      return
    }
    setStateValue(propValue || '')
    setLastChangedValue(propValue || '')
  }, [isDelayed, propValue])

  useEffect((): void => {
    if (shouldFocusOnMount) {
      dom.current?.focus()
    }
  }, [shouldFocusOnMount])

  const submitDelayedChange = useCallback((isFinal: boolean): void => {
    if (!isDelayed || stateValue === lastChangedValue) {
      return
    }
    onChange?.(stateValue)
    if (!isFinal) {
      setLastChangedValue(stateValue)
    }
  }, [isDelayed, lastChangedValue, onChange, stateValue])

  // We use a ref to keep the latest value of submitDelayedChange as we want the last version of it
  // when we unmount while not running it each time it's modified.
  const submitDelayedChangeRef = useRef(submitDelayedChange)
  useEffect((): void => {
    submitDelayedChangeRef.current = submitDelayedChange
  }, [submitDelayedChange])

  // Submit delayed change on unmount.
  useEffect(() => (): void => submitDelayedChangeRef.current?.(true), [])

  // Submit delayed change after a delay except if the stateValue changes again.
  useEffect((): (() => void) => {
    if (!isDelayed) {
      return (): void => void 0
    }
    const timeout = window.setTimeout(
      (): void => submitDelayedChangeRef.current?.(false),
      onChangeDelayMillisecs,
    )
    return (): void => clearTimeout(timeout)
  }, [stateValue, isDelayed, onChangeDelayMillisecs])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    event.stopPropagation()
    const value = applyFunc ? applyFunc(event.target.value) : event.target.value
    if (isDelayed) {
      setStateValue(value)
      onEdit?.(value)
    } else {
      onChange?.(value)
    }
  }, [applyFunc, onChange, onEdit, isDelayed])

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>): void => {
    submitDelayedChange(false)
    onBlur?.(event)
  }, [onBlur, submitDelayedChange])

  const inputValue = isDelayed ? stateValue : propValue
  const inputStyle: React.CSSProperties = {
    background: 'inherit',
    borderRadius: 0,
    color: 'inherit',
    fontSize: 15,
    fontWeight: 'normal',
    height: 41,
    paddingLeft: 15,
    ...style,
  }
  return <input
    {...otherProps} style={inputStyle} onChange={handleChange}
    value={inputValue} onBlur={handleBlur} ref={dom} />
}
export default React.memo(React.forwardRef(Input))

export interface Inputable {
  blur: () => void
  focus: () => void
  select: () => void
}
