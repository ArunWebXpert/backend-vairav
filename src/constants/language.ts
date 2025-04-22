interface ResponseMessages {
  readonly API_HIT_ERROR: string;
  readonly DATA_FETCH_ERROR: string;
  readonly SUCCESS: string;
  readonly USER_ALREADY_EXISTS: string;
  readonly USER_REGISTER_SUCCESS: string;
  INVALID_CREDENTIALS: string;
  INVALID_SIGNATURE: string;
}

const responseMessages = {
  EN: {
    API_HIT_ERROR: 'Web hose api hit failed.',
    DATA_FETCH_ERROR: 'Error fetching data.',
    SUCCESS: 'success',
    USER_REGISTER_SUCCESS: 'User is registered successfully',
    USER_ALREADY_EXISTS: 'User already exists.',
    INVALID_CREDENTIALS: 'Invalid credentials.',
    INVALID_SIGNATURE: 'Invalid signature.',
  },
} as const satisfies Record<string, ResponseMessages>;

const Lang: ResponseMessages =
  responseMessages[process.env.SYSTEM_LANGUAGE || 'EN'] || responseMessages.EN;

export default Lang;
