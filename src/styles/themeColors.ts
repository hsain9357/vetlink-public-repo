// src/styles/themeColors.ts

export const lightColors = {
  background: '#F8F8F8', // Soft white
  text: '#333333', // Dark gray
  secondaryText: '#666666', // Slightly darker secondary text for better contrast
  inputBackground: '#FDFDFD', // Very subtle off-white for inputs
  inputBorder: '#E0E0E0', // Light gray
  buttonPrimary: '#306A75', // A modern, slightly desaturated blue
  buttonSecondary: '#95A5A6', // A softer, more modern gray for secondary actions
  buttonText: '#FFFFFF', // White
  tabBarBackground: '#FFFFFF',
  headerBackground: '#F8F8F8',
  activeTint: '#306A75', // Match primary button
  inactiveTint: '#BBBBBB', // Lighter gray for inactive tint
};

export const darkColors = {
  background: '#1E1E1E', // Slightly less black, softer dark background
  text: '#FFFFFF', // White for text in dark mode
  secondaryText: '#FFFFFF', // White for secondary text in dark mode
  inputBackground: '#2C2C2C', // Slightly lighter input background
  inputBorder: '#555555', // Medium dark gray
  buttonPrimary: '#306A75', // Same modern blue
  buttonSecondary: '#7F8C8D', // A slightly darker, more muted gray for secondary actions
  buttonText: '#FFFFFF',
  tabBarBackground: '#282828', // Slightly lighter tab bar
  headerBackground: '#2C2C2C', // Slightly lighter header
  activeTint: '#306A75',
  inactiveTint: '#888888', // Slightly darker inactive tint for dark mode
};

export type ThemeColors = typeof lightColors;