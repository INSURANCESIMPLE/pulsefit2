/**
 * Conversion & Formatting Utilities for Weight, Height, and Distance
 * Supports seamless toggling between US Imperial and Metric systems
 */

export type WeightUnit = 'lbs' | 'kg';
export type DistanceUnit = 'mi' | 'km';
export type HeightUnit = 'ft-in' | 'cm';

// Weight Helpers
export function convertWeight(kg: number, targetUnit: WeightUnit): number {
  if (targetUnit === 'lbs') {
    return Math.round(kg * 2.20462);
  }
  return Math.round(kg);
}

export function weightToKg(value: number, fromUnit: WeightUnit): number {
  if (fromUnit === 'lbs') {
    return Math.round(value / 2.20462);
  }
  return Math.round(value);
}

export function formatWeight(kg: number, targetUnit: WeightUnit = 'lbs'): string {
  const val = convertWeight(kg, targetUnit);
  return `${val} ${targetUnit}`;
}

// Distance Helpers
export function convertDistance(km: number, targetUnit: DistanceUnit): number {
  if (targetUnit === 'mi') {
    return Number((km * 0.621371).toFixed(1));
  }
  return Number(km.toFixed(1));
}

export function distanceToKm(value: number, fromUnit: DistanceUnit): number {
  if (fromUnit === 'mi') {
    return Number((value / 0.621371).toFixed(1));
  }
  return Number(value.toFixed(1));
}

export function formatDistance(km: number, targetUnit: DistanceUnit = 'mi', decimals = 1): string {
  const val = convertDistance(km, targetUnit);
  return `${val.toFixed(decimals)} ${targetUnit}`;
}

// Height Helpers
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  if (inches === 12) {
    return { feet: feet + 1, inches: 0 };
  }
  return { feet: Math.max(1, feet), inches: Math.max(0, inches) };
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = (feet * 12) + inches;
  return Math.round(totalInches * 2.54);
}

export function formatHeight(cm: number, unit: HeightUnit = 'ft-in'): string {
  if (unit === 'ft-in') {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}' ${inches}"`;
  }
  return `${cm} cm`;
}
