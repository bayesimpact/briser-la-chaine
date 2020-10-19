import React from 'react'

export const darkButtonStyle: React.CSSProperties = {
  alignSelf: 'stretch',
  backgroundColor: colors.ALMOST_BLACK,
  borderRadius: 20,
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'Poppins',
  fontSize: 16,
  fontWeight: 800,
  padding: 14,
  textAlign: 'center',
  textDecoration: 'none',
}
export const lightButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: '#fff',
  border: `solid 1px ${colors.GREYISH_BROWN}`,
  color: colors.ALMOST_BLACK,
}

export const cancelButtonStyle: React.CSSProperties = {
  ...darkButtonStyle,
  backgroundColor: colors.BUTTON_GREY,
}

export const longShareButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  background: colors.ALMOST_BLACK,
  backgroundColor: colors.ALMOST_BLACK,
  borderRadius: 15,
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  fontFamily: 'Poppins',
  fontSize: 13,
  fontWeight: 800,
  padding: 13,
  textDecoration: 'none',
}

