import _isEqual from 'lodash/isEqual'
import PropTypes from 'prop-types'
import React, {useCallback, useMemo, useRef} from 'react'
import ReactSelect from 'react-select'

const getName = ({name}: {name: string}): string => name
const getIsDisabled = ({disabled}: {disabled?: boolean}): boolean => !!disabled
const typedMemo: <T>(c: T) => T = React.memo

export interface SelectOption<T> {
  disabled?: boolean
  name: string

  options?: never
  value: T
}

interface SelectOptionGroup<T> {
  label: string
  options: readonly SelectOption<T>[]
}


type ReactSelectProps<T> = ReactSelect<T>['props']

interface SelectProps<T> extends Omit<ReactSelectProps<SelectOption<T>>, 'onChange'> {
  areUselessChangeEventsMuted?: boolean
  defaultMenuScroll?: number
  isMulti?: boolean
  onChange: ((value: T) => void) | ((value: readonly T[]) => void)
  options: readonly SelectOption<T>[] | readonly SelectOptionGroup<T>[]
  style?: React.CSSProperties
  value?: T | readonly T[]
}


interface OptionProps<T> {
  isFocused: boolean
  options: readonly (SelectOption<T> | SelectOptionGroup<T>)[]
  value?: T
}


const Select = <T extends unknown = string>(props: SelectProps<T>): React.ReactElement => {
  const {areUselessChangeEventsMuted = true, defaultMenuScroll, isMulti, onChange, options, style,
    styles, value, ...otherProps} = props

  const allOptions: readonly SelectOption<T>[] = useMemo(() => {
    const allOptions: SelectOption<T>[] = []
    options.forEach((option: SelectOption<T>|SelectOptionGroup<T>): void => {
      if (option.options) {
        allOptions.push(...option.options)
        return
      }
      allOptions.push(option)
    })
    return allOptions
  }, [options])

  const handleChange = useCallback(
    (option?: SelectOption<T>|readonly SelectOption<T>[]|null): void => {
      if (!option) {
        return
      }
      if (isMulti) {
        const values = (option as readonly SelectOption<T>[]).
          map(({value}: SelectOption<T>): T => value)
        if (!areUselessChangeEventsMuted || !_isEqual(values, value)) {
          (onChange as ((value: readonly T[]) => void))(values)
        }
        return
      }
      const {value: newValue} = option as SelectOption<T>
      if (!areUselessChangeEventsMuted || (newValue !== value)) {
        (onChange as ((value: T) => void))(newValue)
      }
    },
    [areUselessChangeEventsMuted, isMulti, onChange, value],
  )

  const subComponent = useRef<ReactSelect<SelectOption<T>>>()

  const handleMenuOpen = useCallback((): void => {
    const {select = undefined} = subComponent.current || {}
    if (!select) {
      return
    }
    // Either focus on the value or the defaultMenuScroll.
    const focusedOption = value &&
      allOptions.findIndex(({value: thisValue}): boolean => value === thisValue) + 1 || 1 - 1 ||
      defaultMenuScroll
    if (!focusedOption) {
      return
    }
    setTimeout((): void => {
      // Hack to have the desired element at the start of the menu page.
      select.setState(
        {focusedOption: allOptions[focusedOption - 1]},
        (): void => {
          select.focusOption('pagedown')
        },
      )
    })
  }, [defaultMenuScroll, allOptions, value])

  const valueProp = useMemo((): SelectOption<T> | SelectOption<T>[] | undefined => {
    if (isMulti) {
      return (value as T[]).
        map((v): SelectOption<T> | undefined =>
          allOptions.find(({value: optionValue}): boolean => v === optionValue)).
        filter((v): v is SelectOption<T> => !!v)
    }
    return allOptions.find(({value: optionValue}): boolean => value === optionValue)
  }, [isMulti, allOptions, value])

  const selectStyle = {
    height: 41,
    lineHeight: 1.5,
    width: '100%',
    ...style,
  }
  const menuContainerStyle = {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  }
  // TODO(pascal): Fix type of ReactSelect exported component.
  const ref = (subComponent as unknown) as React.Ref<ReactSelect<SelectOption<T>>>
  const borderRadius = style?.borderRadius || 5
  return <ReactSelect<SelectOption<T>>
    onChange={handleChange}
    value={valueProp}
    getOptionLabel={getName}
    isOptionDisabled={getIsDisabled}
    styles={{
      container: (base): React.CSSProperties => ({...base, ...selectStyle}),
      control: (base, {menuIsOpen, options}): React.CSSProperties => ({
        ...base,
        borderRadius: menuIsOpen && options.length ?
          `${borderRadius}px ${borderRadius}px 0 0` : borderRadius,
        borderWidth: 0,
        boxShadow: '0 6px 18px 0 rgba(60, 128, 209, 0.25)',
        height: selectStyle.height,
      }),
      group: (base): React.CSSProperties => ({
        ...base,
        paddingBottom: 0,
        paddingTop: 0,
      }),
      groupHeading: (base): React.CSSProperties => ({
        ...base,
        backgroundColor: colors.LIGHT_BLUE_GREY,
        color: 'inherit',
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 0,
        paddingBottom: 9,
        paddingTop: 9,
        textTransform: 'uppercase',
      }),
      menu: (base): React.CSSProperties => ({
        ...base,
        borderRadius: `0 0 ${borderRadius}px ${borderRadius}px`,
        borderTop: `solid 1px ${colors.LIGHT_BLUE_GREY}`,
        borderWidth: '1px 0 0 0',
        boxShadow: '0 10px 10px 0 rgba(60, 128, 209, 0.15)',
        marginBottom: 0,
        marginTop: 0,
      }),
      menuList: (base): React.CSSProperties => ({
        ...base,
        paddingBottom: 0,
        paddingTop: 0,
      }),
      option: (base, {isFocused, options, value}: OptionProps<T>): React.CSSProperties => {
        const flattenOptions = options?.map(o => o.options || [o])?.
          reduce((a, b) => a.concat(b), []) || []
        const isLastOption = value === flattenOptions.slice(-1)[0]?.value
        return {
          ...base,
          backgroundColor: isFocused ? colors.WHITE_TWO : base.backgroundColor,
          borderRadius: isLastOption ?
            `0 0 ${borderRadius}px ${borderRadius}px` : base.borderRadius,
        }
      },
      placeholder: (base): React.CSSProperties => ({
        ...base,
        color: colors.BUTTON_GREY,
        fontStyle: 'italic',
      }),
      // TODO(zozoens31): Make it possible to override the valueContainer from
      // another component.
      // Horizontal padding is icon size + icon margins.
      valueContainer: (base): React.CSSProperties => ({
        ...base,
        padding: '2px 15px 2px 40px',
      }),
      ...styles,
    }}
    options={options}
    clearable={false}
    menuContainerStyle={menuContainerStyle}
    onMenuOpen={handleMenuOpen}
    ref={ref} isMulti={isMulti}
    {...otherProps} />
}
Select.propTypes = {
  areUselessChangeEventsMuted: PropTypes.bool,
  // Number of options to scroll the menu when first opened.
  defaultMenuScroll: PropTypes.number,
  isMulti: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.shape({
      disabled: PropTypes.bool,
      name: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    }).isRequired,
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(PropTypes.shape({
        disabled: PropTypes.bool,
        name: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
      }).isRequired).isRequired,
    }),
  ])).isRequired,
  style: PropTypes.object,
  value: PropTypes.oneOfType(
    [PropTypes.any, PropTypes.arrayOf(PropTypes.any.isRequired)]),
}
const MemoSelect = typedMemo(Select)

export default MemoSelect
