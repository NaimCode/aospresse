import type { Adherent } from '@prisma/client'
import React from 'react'

const idCard = ({item}:{item:Adherent}) => {
  return (
    <div>
      <IdCardFace item={item}/>
    </div>
  )
}

export default idCard

const IdCardFace = ({item}:{item:Adherent}) => {
  return (
    <div>

    </div>
  )
}