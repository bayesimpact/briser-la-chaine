import React, {useCallback} from 'react'


interface TabsProps {
  onChangeTab: (tab: number) => void
  style: React.CSSProperties
  tabSelected: number
  tabs: readonly string[]
}

// TODO(sil): Get the smooth transition from a module.
const transition = '250ms cubic-bezier(0.18, 0.71, 0.4, 0.82)'

const containerStyle: React.CSSProperties = {
  border: `solid 1px ${colors.SMOKEY_GREY}`,
  borderRadius: 5,
  display: 'flex',
  position: 'relative',
  zIndex: 0,
}
const Tabs = (props: TabsProps): React.ReactElement => {
  const {onChangeTab, style, tabSelected, tabs} = props
  const selectorStyle: React.CSSProperties = {
    backgroundColor: colors.DARK,
    borderRadius: 5,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    transform: `translateX(${tabSelected * 100}%)`,
    transition,
    width: `${100 / (tabs.length || 1)}%`,
    zIndex: 0,
  }
  return <nav style={{...containerStyle, ...style}}>
    <div style={selectorStyle} />
    {tabs.map((text, index): React.ReactElement => <Tab
      key={index} text={text} index={index} isSelected={index === tabSelected}
      onClick={onChangeTab} />)}
  </nav>
}


interface TabProps {
  index: number
  isSelected: boolean
  onClick: (tab: number) => void
  text: string
}

const TabBase = ({index, isSelected, onClick, text}: TabProps): React.ReactElement => {
  const handleClick = useCallback((): void => onClick(index), [index, onClick])
  const containerStyle: React.CSSProperties = {
    alignItems: 'center',
    color: isSelected ? '#fff' : colors.DARK,
    cursor: 'pointer',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    fontSize: 13,
    fontWeight: isSelected ? 'bold' : 'normal',
    height: 38,
    justifyContent: 'center',
    transition,
    zIndex: 1,
  }
  return <div onClick={isSelected ? undefined : handleClick} style={containerStyle}>
    {text}
  </div>
}
const Tab = React.memo(TabBase)


export default React.memo(Tabs)
