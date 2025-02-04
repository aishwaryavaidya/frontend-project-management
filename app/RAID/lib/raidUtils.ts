import { RAIDType, RaidFilters } from "./raidTypes";

export function filterRaids(raids: RAIDType[], filters: RaidFilters): RAIDType[] {
  return raids.filter((raid) => {
    const categoryMatch = !filters.category?.length || filters.category.includes(raid.category);
    const priorityMatch = !filters.priority?.length || filters.priority.includes(raid.priority);
    const statusMatch = !filters.status?.length || filters.status.includes(raid.status);
    return categoryMatch && priorityMatch && statusMatch;
  });
}

// export function generateMockData(count: number): RAIDType[] {
//   // Implementation for generating mock data
// }

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}