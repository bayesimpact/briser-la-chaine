import React from 'react'

// TODO(cyrille): Do not define margins here.
export const darkButtonStyle: React.CSSProperties = {
  alignSelf: 'stretch',
  backgroundColor: '#000',
  borderRadius: 30,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: 16,
  textAlign: 'center',
  textDecoration: 'none',
}
export const lightButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: '#fff',
  border: `solid 1px ${colors.GREYISH_BROWN}`,
  color: colors.GREYISH_BROWN,
}

export const cancelButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.BUTTON_GREY,
}

