export interface SelectDropdownOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectDropdownDisplay {
  label: string
  isPlaceholder: boolean
}

export const getSelectDropdownDisplay = (
  options: SelectDropdownOption[],
  currentValue: string,
  placeholder: string,
): SelectDropdownDisplay => {
  if (!currentValue) {
    return { label: placeholder, isPlaceholder: true }
  }

  const selectedOption = options.find((option) => String(option.value) === currentValue)

  return {
    label: selectedOption?.label ?? currentValue,
    isPlaceholder: false,
  }
}

export const getSelectDropdownOptionId = (listboxId: string, index: number): string => `${listboxId}-option-${index}`
