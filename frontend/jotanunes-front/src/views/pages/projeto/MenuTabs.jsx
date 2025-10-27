import React, { useEffect, useRef } from 'react'

const MenuTabs = ({ activeIndex = 0, onChange = () => {} }) => {
  const menuRef = useRef(null)
  const menuBorderRef = useRef(null)
  const itemRefs = useRef([])

  useEffect(() => {
    if (menuRef.current && menuBorderRef.current && itemRefs.current[activeIndex]) {
      offsetMenuBorder(itemRefs.current[activeIndex], menuBorderRef.current)
    }
  }, [activeIndex])

  useEffect(() => {
    const onResize = () => {
      if (itemRefs.current[activeIndex]) {
        offsetMenuBorder(itemRefs.current[activeIndex], menuBorderRef.current)
      }
      if (menuRef.current) menuRef.current.style.setProperty('--timeOut', 'none')
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex])

  function clickItem(i) {
    if (i === activeIndex) return
    if (menuRef.current) menuRef.current.style.removeProperty('--timeOut')
    onChange(i)
  }

  function offsetMenuBorder(element, menuBorder) {
    if (!element || !menuRef.current || !menuBorder) return
    const offsetActiveItem = element.getBoundingClientRect()
    const left =
      Math.floor(
        offsetActiveItem.left -
          menuRef.current.offsetLeft -
          (menuBorder.offsetWidth - offsetActiveItem.width) / 2
      ) + 'px'
    menuBorder.style.transform = `translate3d(${left}, 0, 0)`
  }

  return (
    <>
      <menu className="menu" ref={menuRef}>
        <button
          className={`menu__item ${activeIndex === 0 ? 'active' : ''}`}
          style={{ '--bgColorItem': '#BC1F1B' }}
          ref={(el) => (itemRefs.current[0] = el)}
          onClick={() => clickItem(0)}
        >
          <svg className="icon" viewBox="0 0 24 24" aria-hidden>
            <path d="M0 0" fill="transparent" />
            <text 
              x="12" 
              y="12" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="currentColor"
            >
              1
            </text>
          </svg>
        </button>

        <button
          className={`menu__item ${activeIndex === 1 ? 'active' : ''}`}
          style={{ '--bgColorItem': '#BC1F1B' }}
          ref={(el) => (itemRefs.current[1] = el)}
          onClick={() => clickItem(1)}
        >
          <svg className="icon" viewBox="0 0 24 24" aria-hidden>
            <path d="M0 0" fill="transparent" />
            <text 
              x="12" 
              y="12" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="currentColor"
            >
              2
            </text>
          </svg>
        </button>

        <button
          className={`menu__item ${activeIndex === 2 ? 'active' : ''}`}
          style={{ '--bgColorItem': '#BC1F1B' }}
          ref={(el) => (itemRefs.current[2] = el)}
          onClick={() => clickItem(2)}
        >
          <svg className="icon" viewBox="0 0 24 24" aria-hidden>
            <path d="M0 0" fill="transparent" />
            <text 
              x="12" 
              y="12" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="currentColor"
            >
              3
            </text>
          </svg>
        </button>

        <button
          className={`menu__item ${activeIndex === 3 ? 'active' : ''}`}
          style={{ '--bgColorItem': '#BC1F1B' }}
          ref={(el) => (itemRefs.current[3] = el)}
          onClick={() => clickItem(3)}
        >
          <svg className="icon" viewBox="0 0 24 24" aria-hidden>
            <path d="M0 0" fill="transparent" />
            <text 
              x="12" 
              y="12" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="currentColor"
            >
              4
            </text>
          </svg>
        </button>

        <button
          className={`menu__item ${activeIndex === 4 ? 'active' : ''}`}
          style={{ '--bgColorItem': '#BC1F1B' }}
          ref={(el) => (itemRefs.current[4] = el)}
          onClick={() => clickItem(4)}
        >
          <svg className="icon" viewBox="0 0 24 24" aria-hidden>
            <path d="M0 0" fill="transparent" />
            <text 
              x="12" 
              y="12" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="currentColor"
            >
              5
            </text>
          </svg>
        </button>
        
      </menu>
    </>
  )
}

export default MenuTabs