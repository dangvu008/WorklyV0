// Import all stats components
import StatsSummaryCard from "./StatsSummaryCard"
import StatusPieChart from "./StatusPieChart"
import MonthSelector from "./MonthSelector"
import DailyHoursChart from "./DailyHoursChart"
import DailyStatusList from "./DailyStatusList"

// Named exports for individual imports
export { StatsSummaryCard, StatusPieChart, MonthSelector, DailyHoursChart, DailyStatusList }

// Default export for the directory
const Stats = {
  StatsSummaryCard,
  StatusPieChart,
  MonthSelector,
  DailyHoursChart,
  DailyStatusList,
}

export default Stats
