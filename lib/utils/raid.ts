// lib/utils/raid.ts

import type { RAIDItem, RaidFilters } from '@/types/raid'

export function getDefaultRAIDItem(projectId: string): Partial<RAIDItem> {
  return {
    projectId,
    status: 'open',
    category: 'Risk',
    priority: 'Medium',
    mitigationPlan: [],
    activitiesLog: [],
    actionItems: [],
    remarks: []
  }
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  try{
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(d)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
}
}

export function filterRaids(raids: RAIDItem[], filters: RaidFilters): RAIDItem[] {
  return raids.filter((raid) => {
    const categoryMatch = !filters.category?.length || filters.category.includes(raid.category || '')
    const priorityMatch = !filters.priority?.length || filters.priority.includes(raid.priority || '')
    const statusMatch = !filters.status?.length || filters.status.includes(raid.status || '')
    const searchMatch = !filters.search || 
      (raid.type?.toLowerCase().includes(filters.search.toLowerCase()) ||
       raid.preventiveAction?.toLowerCase().includes(filters.search.toLowerCase()) ||
       raid.impact?.toLowerCase().includes(filters.search.toLowerCase()) ||
       raid.owner?.toLowerCase().includes(filters.search.toLowerCase()))
    
    return categoryMatch && priorityMatch && statusMatch && searchMatch
  })
}

export function validateRAIDItem(item: Partial<RAIDItem>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!item.category) {
    errors.push('Category is required')
  }

  if (item.probability && (item.probability < 0 || item.probability > 100)) {
    errors.push('Probability must be between 0 and 100')
  }

  if (item.dateRaised && item.sprintDate && new Date(item.dateRaised) > new Date(item.sprintDate)) {
    errors.push('Sprint date cannot be before date raised')
  }

  if (item.dateClosed && item.dateRaised && new Date(item.dateClosed) < new Date(item.dateRaised)) {
    errors.push('Closed date cannot be before date raised')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function getStatusColor(status: string | undefined): string {
  switch (status?.trim().toLowerCase()) {
    case 'open':
      return 'bg-yellow-100 text-yellow-800'
    case 'in progress':
      return 'bg-blue-800 text-white'
    case 'closed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPriorityColor(priority: string | undefined): string {
  switch (priority) {
    case 'Extreme':
      return 'bg-red-100 text-red-800'
    case 'High':
      return 'bg-orange-100 text-orange-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'Low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getCategoryColor(category: string | undefined): string {
  switch (category) {
    case 'Risk':
      return 'bg-red-100 text-red-800'
    case 'Assumption':
      return 'bg-blue-100 text-blue-800'
    case 'Dependency':
      return 'bg-purple-100 text-purple-800'
    case 'Issue':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}