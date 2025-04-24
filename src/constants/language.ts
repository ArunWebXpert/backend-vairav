interface ResponseMessages {
  readonly API_HIT_ERROR: string;
  readonly DATA_FETCH_ERROR: string;
  readonly INVALID_CREDENTIALS: string;
  readonly INVALID_SIGNATURE: string;
  readonly SUCCESS: string;
  readonly USER_ALREADY_EXISTS: string;
  readonly USER_LOGIN_SUCCESS: string;
  readonly USER_REGISTER_SUCCESS: string;
}

const responseMessages = {
  EN: {
    API_HIT_ERROR: 'Web hose api hit failed.',
    DATA_FETCH_ERROR: 'Error fetching data.',
    INVALID_CREDENTIALS: 'Invalid credentials.',
    INVALID_SIGNATURE: 'Invalid signature.',
    SUCCESS: 'success',
    USER_ALREADY_EXISTS: 'User already exists.',
    USER_LOGIN_SUCCESS: 'User is logged in successfully',
    USER_REGISTER_SUCCESS: 'User is registered successfully',
  },
} as const satisfies Record<string, ResponseMessages>;

const Lang: ResponseMessages =
  responseMessages[process.env.SYSTEM_LANGUAGE || 'EN'] || responseMessages.EN;

export default Lang;
