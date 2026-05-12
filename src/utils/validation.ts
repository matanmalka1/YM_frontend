const ISRAELI_IDENTIFIER_LENGTH = 9

const DIGITS_ONLY_REGEX = /^\d+$/

export const validateIsraeliIdentifierChecksum = (value: string): boolean => {
  if (value.length !== ISRAELI_IDENTIFIER_LENGTH) return false
  if (!DIGITS_ONLY_REGEX.test(value)) return false

  let total = 0

  for (let index = 0; index < value.length; index += 1) {
    let n = Number(value[index])

    if (index % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }

    total += n
  }

  return total % 10 === 0
}
