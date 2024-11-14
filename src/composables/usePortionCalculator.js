import { ref } from 'vue'

export const usePortionCalculator = () => {
  const parsePortionString = (portionStr) => {
    const match = portionStr.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/)
    if (!match) return null
    return {
      amount: parseFloat(match[1]),
      unit: match[3]
    }
  }

  const formatPortion = (amount, unit) => {
    return `${amount.toFixed(1)}${unit}`
  }

  const calculateNewPortion = (originalPortion, newValue, isMultiplier = true) => {
    const parsed = parsePortionString(originalPortion)
    if (!parsed) return null

    if (isMultiplier) {
      return formatPortion(parsed.amount * newValue, parsed.unit)
    } else {
      return formatPortion(newValue, parsed.unit)
    }
  }

  return {
    parsePortionString,
    formatPortion,
    calculateNewPortion
  }
} 