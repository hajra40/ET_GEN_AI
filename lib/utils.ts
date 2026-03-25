import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 0) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getStatusTone(score: number) {
  if (score >= 80) {
    return "text-emerald-700";
  }

  if (score >= 60) {
    return "text-sky-700";
  }

  if (score >= 40) {
    return "text-amber-700";
  }

  return "text-rose-700";
}

export function getThisYear() {
  return new Date().getFullYear();
}
