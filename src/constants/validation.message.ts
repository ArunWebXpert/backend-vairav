const validationMessages = {
  EN: {
    // generic
    PROPERTY_REQUIRED: '$property is required.',
    MUST_BE_VALID_JWT_TOKEN: '$property must be valid JWT token.',
    MUST_BE_ASC_OR_DESC: '$property must be ASC or DESC.',
    MUST_BE_BOOLEAN: '$property must be true or false.',
    PROPERTY_MUST_BE_BOOLEAN: '$property mus be either true or false.',
    PROPERTY_CANNOT_BE_EMPTY_ARRAY: '$property cannot be an empty array.',
    PROPERTY_MUST_BE_AN_ARRAY: '$property must be an array.',
    MUST_BE_TRUE_OR_FALSE: '$property must be either true or false.',
    PROPERTY_MAX_LENGTH:
      '$property cannot be more than $constraint1 characters.',
    PROPERTY_MUST_BE_ARRAY: '$property must be an array.',
    ARRAY_MUST_CONTAIN_UNIQUE_VALUES:
      '$property array must contain unique values.',

    PROPERTY_MIN_VALUE: '$property must be minimum $constraint1.',
    PROPERTY_MAX_VALUE: '$property must be maximum $constraint1.',

    PROPERTY_MUST_BE_UUID: 'The provided ID must be a valid UUID.',
  },
};
const lang = process.env.SYSTEM_LANGUAGE || 'EN';

let MSG;

if (lang === 'EN') {
  MSG = validationMessages.EN;
}

export default MSG;
