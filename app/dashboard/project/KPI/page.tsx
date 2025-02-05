import React from 'react'
import { KPITracker } from './KPITracker'
// import { KPIAnalytics } from './KPIAnalytics';
import { Toaster } from 'sonner';

const page = () => {
  return (
    <div>
      {/* <KPIAnalytics kpis={[]} weeks={[]} /> */}
      <KPITracker/>
      <Toaster position="top-right" />
    </div>
  )
}

export default page
