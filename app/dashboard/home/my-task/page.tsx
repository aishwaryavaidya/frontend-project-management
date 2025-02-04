import React from 'react'
import { KanbanBoard } from './KanbanBoard'
import { Toaster } from 'sonner';

const page = () => {
  return (
    <div>
      <KanbanBoard/>
      <Toaster position="top-right" />
    </div>
  )
}

export default page
