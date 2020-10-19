import React from 'react'


interface ProgressBarProps {
  progress: number
  progressContainerStyle?: React.CSSProperties
  progressStyle?: React.CSSProperties
  progressTextStyle?: React.CSSProperties
  total: number
  style?: React.CSSProperties
  text: string
}

const ProgressBar = (props: ProgressBarProps): React.ReactElement => {
  const {total, progress, progressContainerStyle, progressStyle, progressTextStyle,
    text, style} = props
  const containerBarStyle: React.CSSProperties = {
    backgroundColor: 'rgb(212, 220, 231, .6)',
    borderRadius: 10,
    height: 12,
    overflow: 'hidden',
    position: 'relative',
    // Stunt to enforce overflow hidden on Firefox.
    transform: 'scale(1)',
    ...progressContainerStyle,
  }
  const textStyle: React.CSSProperties = {
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
    ...progressTextStyle,
  }
  const progressBarStyle: React.CSSProperties = {
    backgroundColor: colors.MINTY_GREEN,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    transition: '200ms 500ms',
    width: `${Math.max(3, progress * 100 / (total || 1))}%`,
    ...progressStyle,
  }
  return <div style={style}>
    <div style={containerBarStyle}>
      <div style={progressBarStyle} />
    </div>
    <div style={textStyle}>
      {text}
    </div>
  </div>
}
export default React.memo(ProgressBar)
