import * as dashboardService from '../services/dashboard.service.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// summary
export const getSummary = asyncHandler(async (req, res) => {
    const { from, to } = req.validatedData.query

    const summary = await dashboardService.getSummary({ from, to })

    return res.status(200).json(new ApiResponse(200, summary, 'Summary fetched successfully'))
})

// category breakdown
export const getCategoryBreakdown = asyncHandler(async (req, res) => {
    const { from, to, type } = req.validatedData.query

  const breakdown = await dashboardService.getCategoryBreakdown({ from, to, type })

  return res
    .status(200)
    .json(new ApiResponse(200, breakdown, 'Category breakdown fetched successfully'))
})

// monthly trends
export const getMonthlyTrends = asyncHandler(async (req, res) => {
  const { from, to, groupBy } = req.validatedData.query

  const trends = await dashboardService.getMonthlyTrends({ from, to, groupBy })

  return res
    .status(200)
    .json(new ApiResponse(200, trends, 'Trends fetched successfully'))
})

// recent activity
export const getRecentActivity = asyncHandler(async (req, res) => {
  const { limit } = req.validatedData.query

  const activity = await dashboardService.getRecentActivity({ limit })

  return res
    .status(200)
    .json(new ApiResponse(200, activity, 'Recent activity fetched successfully'))
})