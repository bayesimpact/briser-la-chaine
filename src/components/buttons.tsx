import React from 'react'

// TODO(cyrille): Do not define margins here.
export const darkButtonStyle: React.CSSProperties = {
  alignSelf: 'stretch',
  backgroundColor: '#000',
  borderRadius: 20,
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'Poppins',
  fontSize: 16,
  fontWeight: 800,
  margin: '0 0 20px',
  padding: 14,
  textAlign: 'center',
  textDecoration: 'none',
}
export const lightButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: '#fff',
  border: `solid 1px ${colors.GREYISH_BROWN}`,
  color: '#000',
}

export const cancelButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.BUTTON_GREY,
}

