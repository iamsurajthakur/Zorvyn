import { FinancialRecord } from "../models/record.model.js";

const buildDateMatch = (from, to) => {
    const match = { isDeleted: false}
    if (from || to) {
    match.date = {}
    if (from) match.date.$gte = from
    if (to)   match.date.$lte = to
  }
  return match
}

// summary
export const getSummary = async ({ from, to }) => {
  const match = buildDateMatch(from, to)

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id:       '$type',
        total:     { $sum: '$amount' },
        count:     { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        maxAmount: { $max: '$amount' },
        minAmount: { $min: '$amount' },
      }
    }
  ])

  const summary = {
    income:  { total: 0, count: 0, average: 0, highest: 0, lowest: 0 },
    expense: { total: 0, count: 0, average: 0, highest: 0, lowest: 0 },
  }

  result.forEach(({ _id, total, count, avgAmount, maxAmount, minAmount }) => {
    const key = _id === 'INCOME' ? 'income' : 'expense'
    summary[key] = {
      total:   parseFloat((total      / 100).toFixed(2)),
      count,
      average: parseFloat((avgAmount  / 100).toFixed(2)),
      highest: parseFloat((maxAmount  / 100).toFixed(2)),
      lowest:  parseFloat((minAmount  / 100).toFixed(2)),   
    }
  })

  summary.netBalance  = parseFloat((summary.income.total - summary.expense.total).toFixed(2))
  summary.savingsRate = summary.income.total > 0
    ? parseFloat(((summary.netBalance / summary.income.total) * 100).toFixed(2))
    : 0

  return summary
}

// category breakdown
export const getCategoryBreakdown = async ({ from, to, type }) => {
  const match = buildDateMatch(from, to)
  if (type) match.type = type

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id:         { type: '$type', category: '$category' },
        total:       { $sum: '$amount' },
        count:       { $sum: 1 },
        avgAmount:   { $avg: '$amount' },
      }
    },
    { $sort: { total: -1 } },  //highest spending category first
    {
      $group: {
        _id:        '$_id.type',
        categories: {
          $push: {
            category:   '$_id.category',
            total:      '$total',
            count:      '$count',
            average:    '$avgAmount',
          }
        },
        typeTotal: { $sum: '$total' },
      }
    }
  ])

  // Calculate percentage share per category
  const breakdown = {}

  result.forEach(({ _id, categories, typeTotal }) => {
    breakdown[_id.toLowerCase()] = {
        total: parseFloat((typeTotal / 100).toFixed(2)),
        categories: categories.map((cat) => ({
        category:   cat.category,
        total:      parseFloat((cat.total   / 100).toFixed(2)),
        average:    parseFloat((cat.average / 100).toFixed(2)),
        count:      cat.count,
        percentage: parseFloat(((cat.total / typeTotal) * 100).toFixed(2)),
        }))
    }
})

  return breakdown
}

// monthly trends
export const getMonthlyTrends = async ({ from, to, groupBy = 'month' }) => {
  const match = buildDateMatch(from, to)

  // Supports both monthly and weekly grouping
  const dateGroup = groupBy === 'week'
    ? {
        year:  { $isoWeekYear: '$date' },
        week:  { $isoWeek:     '$date' },
      }
    : {
        year:  { $year:  '$date' },
        month: { $month: '$date' },
      }

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          ...dateGroup,
          type: '$type',
        },
        total:  { $sum: '$amount' },
        count:  { $sum: 1 },
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
    {
      // Group by period — puts INCOME and EXPENSE side by side per period
      $group: {
        _id: groupBy === 'week'
          ? { year: '$_id.year', week: '$_id.week' }
          : { year: '$_id.year', month: '$_id.month' },
        entries: {
          $push: {
            type:  '$_id.type',
            total: '$total',
            count: '$count',
          }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])

  // Shape into clean period objects with income + expense side by side
  return result.map(({ _id, entries }) => {
    const period = {
        year:    _id.year,
        ...(groupBy === 'week'
        ? { week:  _id.week  }
        : { month: _id.month }
        ),
        income:  { total: 0, count: 0 },
        expense: { total: 0, count: 0 },
    }

    entries.forEach(({ type, total, count }) => {
        const key = type === 'INCOME' ? 'income' : 'expense'
        period[key] = {
        total: parseFloat((total / 100).toFixed(2)),
        count
        }
  })

  period.net = parseFloat((period.income.total - period.expense.total).toFixed(2))

  return period
})
}

// recent activity
export const getRecentActivity = async ({ limit = 10 }) => {
  const records = await FinancialRecord.find()
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)

  return records
}