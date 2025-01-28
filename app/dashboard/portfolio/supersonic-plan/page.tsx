import ProjectTable from '@/components/Tables/ProjectTable'
import React from 'react'
import { SupersonicTable } from './SupersonicTable'
import { Supersonic2Table } from './Supersonic2Table'

const page = () => {
  return (
    <div>
      <SupersonicTable/>
      <Supersonic2Table/>
    </div>
  )
}

export default page
