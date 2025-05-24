// Utility functions for the device simulator

// Generate random number between min and max (inclusive)
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// Generate random number with normal distribution (bell curve)
export function randomNormal(mean: number, stdDev: number): number {
  // Box-Muller transform for normal distribution
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

// Round to specified decimal places
export function roundTo(num: number, decimals = 2): number {
  return Number(num.toFixed(decimals))
}

// Generate a random device ID
export function generateDeviceId(): string {
  return `SD-${Math.floor(1000 + Math.random() * 9000)}`
}

// Generate a random device name
export function generateDeviceName(): string {
  const locations = ["Master Bedroom", "Laundry Room", "Basement", "Utility Room", "Garage"]
  return `${locations[Math.floor(Math.random() * locations.length)]} Dryer`
}

// Generate a random device model
export function generateDeviceModel(): string {
  const models = ["SmartDry Pro", "SmartDry Mini", "SmartDry Ultra", "SmartDry Eco", "SmartDry Max"]
  return models[Math.floor(Math.random() * models.length)]
}

// Generate a random drying mode
export function generateDryingMode(): string {
  const modes = ["Normal", "Quick", "Delicate", "Heavy Duty", "Eco"]
  return modes[Math.floor(Math.random() * modes.length)]
}

// Calculate estimated drying time based on mode and settings
export function calculateEstimatedTime(mode: string, aiEnabled = true, ecoMode = false): number {
  // Base time in minutes
  let baseTime = 60

  switch (mode.toLowerCase()) {
    case "quick":
      baseTime = 30
      break
    case "delicate":
      baseTime = 45
      break
    case "normal":
      baseTime = 60
      break
    case "heavy duty":
      baseTime = 90
      break
    case "eco":
      baseTime = 75
      break
    default:
      baseTime = 60
  }

  // AI optimization reduces time by 15%
  if (aiEnabled) {
    baseTime = Math.round(baseTime * 0.85)
  }

  // Eco mode increases time by 10%
  if (ecoMode) {
    baseTime = Math.round(baseTime * 1.1)
  }

  return baseTime
}

// Calculate energy usage based on mode and settings
export function calculateEnergyUsage(mode: string, aiEnabled = true, ecoMode = false): number {
  // Base energy in kWh
  let baseEnergy = 1.2

  switch (mode.toLowerCase()) {
    case "quick":
      baseEnergy = 0.8
      break
    case "delicate":
      baseEnergy = 0.7
      break
    case "normal":
      baseEnergy = 1.2
      break
    case "heavy duty":
      baseEnergy = 1.8
      break
    case "eco":
      baseEnergy = 1.0
      break
    default:
      baseEnergy = 1.2
  }

  // AI optimization reduces energy by 10%
  if (aiEnabled) {
    baseEnergy = baseEnergy * 0.9
  }

  // Eco mode reduces energy by 15%
  if (ecoMode) {
    baseEnergy = baseEnergy * 0.85
  }

  return Number.parseFloat(baseEnergy.toFixed(2))
}
