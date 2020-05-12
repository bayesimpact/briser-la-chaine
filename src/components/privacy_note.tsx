import Lock2FillIcon from 'remixicon-react/Lock2FillIcon'
import React from 'react'


interface PrivacyNoteProps {
  text: string
  style?: React.CSSProperties
}
const iconStyle: React.CSSProperties = {
  marginRight: 6,
}

const PrivacyNote = ({text, style}: PrivacyNoteProps): React.ReactElement => {
  const containerStyle: React.CSSProperties = {
    alignItems: 'center',
    display: 'flex',
    fontSize: 13,
    margin: '10px 0 30px',
    ...style,
  }
  return <div style={containerStyle}>
    <Lock2FillIcon size={10} style={iconStyle} />
    <span>{text}</span>
  </div>
}
export default React.memo(PrivacyNote)
