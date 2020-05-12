import React, {useCallback} from 'react'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'


interface BulletProps {
  color?: string
  index: number
  isLast: boolean
  isSelected: boolean
  onClick: (index: number) => void
  selectColor?: string
  transition?: string
}


const BulletBase = (props: BulletProps): React.ReactElement => {
  const {color = colors.MEDIUM_GREY, index, isLast, isSelected, onClick,
    selectColor = colors.WARM_GREY, transition} = props
  const handleClick = useCallback((): void => onClick(index), [index, onClick])
  const bulletStyle: React.CSSProperties = {
    backgroundColor: isSelected ? selectColor : color,
    borderRadius: 10,
    cursor: 'pointer',
    height: 13,
    marginRight: isLast ? 0 : 14,
    transition,
    width: 13,
  }
  return <div style={bulletStyle} onClick={handleClick} />
}
const Bullet = React.memo(BulletBase)


interface BulletsProps {
  arrowColor?: string
  borderColor?: string
  color?: string
  indexVisible: number
  numBullets: number
  onSelect: (index: number) => void
  selectColor?: string
  transition?: string
}


const bulletsContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 20,
}


const Bullets = (props: BulletsProps): React.ReactElement => {
  const {arrowColor = '#fff', borderColor = colors.MEDIUM_GREY, color, indexVisible, numBullets,
    onSelect, selectColor, transition} = props
  const arrowButtonStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: arrowColor,
    border: `solid 1px ${borderColor}`,
    borderRadius: 45,
    color: selectColor,
    cursor: 'pointer',
    display: 'flex',
    flex: 'none',
    height: 45,
    justifyContent: 'center',
    position: 'relative',
    transition,
    width: 45,
    zIndex: 1,
  }
  const hiddenArrowButtonStyle: React.CSSProperties = {
    ...arrowButtonStyle,
    opacity: 0,
    pointerEvents: 'none',
  }
  const isPreviousHidden = !indexVisible
  const handlePrevious = useCallback((): void => {
    if (indexVisible) {
      onSelect(indexVisible - 1)
    }
  }, [indexVisible, onSelect])
  const isNextHidden = indexVisible >= numBullets - 1
  const handleNext = useCallback((): void => {
    if (indexVisible < numBullets - 1) {
      onSelect(indexVisible + 1)
    }
  }, [indexVisible, numBullets, onSelect])
  return <div style={bulletsContainerStyle}>
    <div
      onClick={handlePrevious} style={isPreviousHidden ? hiddenArrowButtonStyle : arrowButtonStyle}>
      <ArrowLeftSLineIcon />
    </div>
    <div style={{width: 40}} />
    {new Array(numBullets).fill(undefined).map(
      (unused, index: number) => <Bullet
        key={index} isSelected={index === indexVisible} index={index} onClick={onSelect}
        isLast={index === numBullets - 1} {...{color, selectColor, transition}} />)}
    <div style={{width: 40}} />
    <div onClick={handleNext} style={isNextHidden ? hiddenArrowButtonStyle : arrowButtonStyle}>
      <ArrowRightSLineIcon />
    </div>
  </div>
}


export default React.memo(Bullets)
