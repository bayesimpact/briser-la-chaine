import _without from 'lodash/without'
import React, {useCallback, useMemo, useState} from 'react'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'

interface WrappedInputProps {
  isDisabled?: boolean
  isHovered?: boolean
  onClick?: (event?: React.SyntheticEvent<HTMLDivElement>) => void
  onKeyPress?: (event?: React.KeyboardEvent<HTMLDivElement>) => void
  tabIndex?: number
}


interface WrappedInputInnerProps extends Omit<WrappedInputProps, 'isDisabled'|'isHovered'> {
  isHighlighted: boolean
}

function useWrappedInput(props: WrappedInputProps): WrappedInputInnerProps {
  const {
    isDisabled,
    isHovered,
    onClick,
    onKeyPress,
    tabIndex = 0,
  } = props

  const handleKeyPress = useCallback((event?: React.KeyboardEvent<HTMLDivElement>): void => {
    if (onClick) {
      onClick(event)
    } else {
      onKeyPress?.(event)
    }
  }, [onClick, onKeyPress])

  return {
    isHighlighted: !isDisabled && !!isHovered,
    onClick: isDisabled ? undefined : onClick,
    onKeyPress: isDisabled ? undefined : handleKeyPress,
    tabIndex: isDisabled ? undefined : tabIndex,
  }
}


interface WrappedInputConfig extends WrappedInputProps {
  isSelected?: boolean
  size?: number
  style?: React.CSSProperties
}

const CheckboxBase =
(props: WrappedInputConfig, ref: React.Ref<HTMLDivElement>): React.ReactElement => {
  const {isSelected, size = 25, style} = props
  const {isHighlighted, ...otherProps} = useWrappedInput(props)
  const {onClick} = otherProps

  const outerBoxStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: isSelected ? '#000' : '#fff',
    borderColor: isHighlighted || isSelected ? '#000' : colors.MEDIUM_GREY,
    borderRadius: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    boxSizing: 'border-box',
    color: '#fff',
    ...onClick && {cursor: 'pointer'},
    display: 'flex',
    fontSize: 16,
    height: size,
    justifyContent: 'center',
    position: 'absolute',
    width: size,
  }
  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    height: outerBoxStyle.height,
    position: 'relative',
    width: outerBoxStyle.width,
    ...style,
  }
  return <div style={containerStyle} ref={ref} {...otherProps}>
    <div style={outerBoxStyle}>
      {isSelected ? <CheckLineIcon size={16} /> : null}
    </div>
  </div>
}
const Checkbox = React.memo(React.forwardRef(CheckboxBase))

export interface LabeledCheckboxProps {
  isDisabled?: boolean
  isSelected?: boolean
  label: React.ReactNode
  onClick?: (event?: React.SyntheticEvent<HTMLDivElement>) => void
  style?: React.CSSProperties
}


const LabeledCheckboxBase = (props: LabeledCheckboxProps): React.ReactElement => {
  const {isDisabled, isSelected, label, onClick, style, ...otherProps} = props
  const [isHovered, setIsHovered] = useState(false)

  const onMouseEnter = useCallback((): void => setIsHovered(true), [])
  const onMouseLeave = useCallback((): void => setIsHovered(false), [])

  const handleClick = useCallback((event?: React.SyntheticEvent<HTMLDivElement>): void => {
    if (onClick) {
      // Prevent the click to be consumed twice.
      event?.stopPropagation()
    }
    onClick?.(event)
  }, [onClick])

  const containerStyle: React.CSSProperties = {
    alignItems: 'center',
    cursor: isDisabled ? 'initial' : 'pointer',
    display: 'flex',
    listStyle: 'none',
    margin: '20px 0',
    ...style,
  }
  return <div
    {...otherProps} style={containerStyle}
    onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
    onClick={isDisabled ? undefined : handleClick}>
    <Checkbox
      style={{flex: 'none'}} onClick={isDisabled ? undefined : handleClick}
      {...{isDisabled, isHovered, isSelected}} />
    <span style={{marginLeft: 10}}>
      {label}
    </span>
  </div>
}
const LabeledCheckbox = React.memo(LabeledCheckboxBase)

interface CheckboxListProps<T> {
  checkboxStyle?: React.CSSProperties | ((index: number) => React.CSSProperties)
  onChange: (value: readonly T[]) => void
  options: readonly {
    name: React.ReactNode
    value: T
  }[]
  selectedCheckboxStyle?: React.CSSProperties
  style?: React.CSSProperties
  values: readonly T[] | undefined
}


const emptyArray = [] as const
const typedMemo: <T>(c: T) => T = React.memo


interface CheckboxListItemProps<T> extends Omit<LabeledCheckboxProps, 'onClick'|'type'> {
  onClick: (value: T) => void
  value: T
}


const CheckboxListItemBase = <T extends string>(
  props: CheckboxListItemProps<T>): React.ReactElement => {
  const {onClick, value, ...otherProps} = props
  const handleClick = useCallback((): void => {
    onClick?.(value)
  }, [onClick, value])
  return <LabeledCheckbox onClick={handleClick} {...otherProps} />
}
const CheckboxListItem = typedMemo(CheckboxListItemBase)


const CheckboxListBase =
<T extends string = string>(props: CheckboxListProps<T>): React.ReactElement => {
  const {options, checkboxStyle, onChange, selectedCheckboxStyle, values = emptyArray,
    ...extraProps} = props
  const valuesSelected = useMemo((): Set<T> => new Set(values), [values])

  const handleChange = useCallback((optionValue: T): void => {
    const isSelected = valuesSelected.has(optionValue)
    const newValues = isSelected ?
      _without(values, optionValue) :
      [optionValue].concat(values)
    onChange(newValues)
  }, [onChange, values, valuesSelected])

  const labelStyle = {
    marginTop: 10,
  }

  return <div {...extraProps}>
    {(options || []).map((option, index): React.ReactNode => {
      const isSelected = valuesSelected.has(option.value)
      return <CheckboxListItem<T>
        key={option.value + ''} label={option.name}
        style={{
          ...labelStyle,
          ...(typeof checkboxStyle === 'function' ? checkboxStyle(index) : checkboxStyle),
          ...isSelected && selectedCheckboxStyle,
        }}
        isSelected={isSelected} onClick={handleChange} value={option.value} />
    })}
  </div>
}

export default typedMemo(CheckboxListBase)
