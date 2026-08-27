// Validation constants to match backend validation messages
export const VALIDATION_MESSAGES = {
  CONTACT: {
    REQUIRED: 'Contact number is required',
    INVALID: 'Please enter exactly 10 digits starting with 6, 7, 8, or 9',
    DUPLICATE: 'Alternate contact number cannot be the same as primary contact number',
    DIFFERENT: 'Alternate contact number must be different from primary contact number'
  },
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address'
  },
  FIELD: {
    REQUIRED: 'This field is required'
  },
  FORM: {
    FILL_ALL_REQUIRED: 'Please fill all required fields'
  },
  LIST: {
    DUPLICATE: 'already exists',
    AT_LEAST_ONE_REQUIRED: 'is required'
  },
  NAME: {
    REQUIRED: 'Name is required',
    INVALID: 'Please enter a valid name (only letters and spaces, minimum 3 characters)',
    MIN_LENGTH: 'Name must be at least 3 characters',
    INVALID_CHARS: 'Name can only contain letters and spaces'
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    CURRENT_REQUIRED: 'Current password is required',
    COMPLEXITY: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character (@$!%*?&)',
    MISMATCH: 'Passwords do not match',
    INCORRECT: 'Current password is incorrect. Please try again'
  },
  QUALIFICATION: {
    REQUIRED: 'Qualification is required',
    MIN_LENGTH: 'Qualification must be at least 2 characters'
  },
  BOARD: {
    REQUIRED: 'Board selection is required',
    INVALID: 'Please select a valid board'
  },
  SCHOOL: {
    REQUIRED: 'School selection is required',
    INVALID: 'Please select a valid school',
    SELECT_BOARD_FIRST: 'Please select a board first',
    NO_SCHOOLS: 'This board has no schools'
  },
  MEDIUM: {
    REQUIRED: 'Please select at least one medium'
  },
  STANDARD: {
    REQUIRED: 'Please select at least one standard'
  },
  STUDENT: {
    ID_REQUIRED: 'Student ID is required',
    ID_INVALID: 'Please enter a valid student ID',
    SELECT_STANDARD_FIRST: 'Please select a standard first'
  },
  TEACHER_SUBJECTS: {
    REQUIRED: 'Please select at least one standard with subjects'
  },
  SECTION: {
    QUESTION_NUMBER: 'Please enter a valid question number greater than 0',
    SUB_QUESTION: 'Please enter a valid sub question',
    NAME: 'Please enter a section name',
    HEADER_FIELDS: 'Please fill in all section header fields',
    TOTAL_QUESTIONS: 'Please enter total questions',
    REQUIRED_QUESTIONS: 'Please enter required questions',
    MARKS_PER_QUESTION: 'Please enter marks per question',
    MARKS_GREATER_THAN_ZERO: 'Marks per question must be greater than 0'
  }
}

// Title case function to format names properly
export const toTitleCase = (str: string): string => {
  if (!str) return ''
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Name validation function
export const validateName = (name: string): boolean => {
  if (!name) return false
  
  const trimmedName = name.trim()
  
  // Must be at least 3 characters and only contain letters and spaces
  return trimmedName.length >= 3 && /^[a-zA-Z\s]+$/.test(trimmedName)
}

// Password validation function (matches resetPassword.html pattern)
export const validatePassword = (password: string): boolean => {
  if (!password) return false
  
  // Must contain at least 8 characters with uppercase, lowercase, number and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Contact number validation function
export const validateContactNumber = (number: string): boolean => {
  if (!number) return false
  
  // Remove all non-digit characters for validation
  const cleaned = number.replaceAll(/\D/g, '')
  
  // Handle both formats:
  // 1. Plain 10-digit number (6-9 followed by 9 digits)
  // 2. +91 prefixed number (91 followed by 10-digit number starting with 6-9)
  if (cleaned.length === 10) {
    // Plain 10-digit format - must start with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(cleaned)
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // +91 prefixed format
    const phoneNumber = cleaned.substring(2) // Remove '91' prefix
    return phoneNumber.length === 10 && /^[6-9]\d{9}$/.test(phoneNumber)
  }
  
  return false
}

// Contact number formatting function for display (no + prefix, allow more than 10 digits to show user input)
export const formatContactNumber = (number: string): string => {
  if (!number) return ''
  
  // Remove all non-digit characters
  const cleaned = number.replaceAll(/\D/g, '')
  
  // Return the cleaned number as-is (don't limit to 10 digits for display)
  return cleaned
}

// Function to format contact number for API submission (adds +91)
export const formatContactNumberForAPI = (number: string): string => {
  if (!number) return ''
  
  // Remove all non-digit characters
  const cleaned = number.replaceAll(/\D/g, '')
  
  // Handle different formats:
  if (cleaned.length === 10) {
    // Plain 10-digit format - add +91
    return `+91${cleaned}`
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already has 91 prefix - add + sign
    return `+${cleaned}`
  }
  
  // Return as-is for other formats (shouldn't happen with proper validation)
  return cleaned
}

// Email validation without backtracking-prone regex (Sonar S5852)
export const validateEmail = (email: string): boolean => {
  const value = String(email).trim().toLowerCase()
  if (value.length < 5 || value.length > 254) return false

  const at = value.indexOf('@')
  if (at < 1 || at !== value.lastIndexOf('@')) return false

  const local = value.slice(0, at)
  const domain = value.slice(at + 1)
  if (!local || !domain || local.includes(' ') || domain.includes(' ')) return false
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false

  const lastDot = domain.lastIndexOf('.')
  if (lastDot < 1 || lastDot === domain.length - 1) return false

  const tld = domain.slice(lastDot + 1)
  return tld.length >= 2
} 