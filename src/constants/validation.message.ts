interface IValidationErrorMessages {
  readonly ARRAY_MUST_CONTAIN_UNIQUE_VALUES: string;
  readonly MUST_BE_ASC_OR_DESC: string;
  readonly MUST_BE_BOOLEAN: string;
  readonly MUST_BE_TRUE_OR_FALSE: string;
  readonly MUST_BE_VALID_JWT_TOKEN: string;
  readonly PROPERTY_CANNOT_BE_EMPTY_ARRAY: string;
  readonly PROPERTY_MAX_LENGTH: string;
  readonly PROPERTY_MAX_VALUE: string;
  readonly PROPERTY_MIN_VALUE: string;
  readonly PROPERTY_MUST_BE_AN_ARRAY: string;
  readonly PROPERTY_MUST_BE_ARRAY: string;
  readonly PROPERTY_MUST_BE_BOOLEAN: string;
  readonly PROPERTY_MUST_BE_UUID: string;
  readonly PROPERTY_REQUIRED: string;
  readonly PROPERTY_MUST_BE_EMAIL: string;
}

const validationMessages: Record<string, IValidationErrorMessages> = {
  EN: {
    PROPERTY_REQUIRED: '$property is required.',
    MUST_BE_VALID_JWT_TOKEN: '$property must be valid JWT token.',
    MUST_BE_ASC_OR_DESC: '$property must be ASC or DESC.',
    MUST_BE_BOOLEAN: '$property must be true or false.',
    PROPERTY_MUST_BE_BOOLEAN: '$property must be either true or false.',
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
    PROPERTY_MUST_BE_EMAIL: '$property must be a valid email.',
  },
};

const lang = process.env.SYSTEM_LANGUAGE || 'EN';
const MSG: IValidationErrorMessages =
  validationMessages[lang] || validationMessages.EN;

export default MSG;
