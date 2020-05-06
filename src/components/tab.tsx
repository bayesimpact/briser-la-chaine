import React from 'react'


interface TabProps {
  isSelected: boolean
  onClick: () => void
  text: string
}

// TODO(sil): Get the smooth transition from a module.
const Tab = ({isSelected, onClick, text}: TabProps): React.ReactElement => {
  const containerStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: isSelected ? colors.DARK : 'inherit',
    border: isSelected ? `solid 1px ${colors.DARK}` : `solid 1px ${colors.SMOKEY_GREY}`,
    borderRadius: 5,
    color: isSelected ? '#fff' : colors.DARK,
    cursor: 'pointer',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    fontSize: 13,
    fontWeight: isSelected ? 'bold' : 'normal',
    height: 38,
    justifyContent: 'center',
    transform: isSelected ? 'scale(1.1, 1)' : 'none',
    transition: 'all 450ms cubic-bezier(0.18, 0.71, 0.4, 0.82) 0ms',
    zIndex: isSelected ? 1 : 0,
  }
  return <div onClick={isSelected ? undefined : onClick} style={containerStyle}>
    {text}
  </div>
}
export default React.memo(Tab)
