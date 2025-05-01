interface ResponseMessages {
  readonly CLEAN_DB_BEFORE_SEEDING: string;
  readonly API_HIT_ERROR: string;
  readonly DATA_FETCH_ERROR: string;
  readonly INVALID_CREDENTIALS: string;
  readonly INVALID_SIGNATURE: string;
  readonly SUCCESS: string;
  readonly USER_ALREADY_EXISTS: string;
  readonly USER_LOGIN_SUCCESS: string;
  readonly USER_REGISTER_SUCCESS: string;
  readonly DB_SEED_SUCCESS: string;
}

const responseMessages = {
  EN: {
    API_HIT_ERROR: 'Web hose api hit failed.',
    CLEAN_DB_BEFORE_SEEDING: 'Clean DB before seeding.',
    DATA_FETCH_ERROR: 'Error fetching data.',
    INVALID_CREDENTIALS: 'Invalid credentials.',
    INVALID_SIGNATURE: 'Invalid signature.',
    SUCCESS: 'success',
    USER_ALREADY_EXISTS: 'User already exists.',
    USER_LOGIN_SUCCESS: 'User is logged in successfully',
    USER_REGISTER_SUCCESS: 'User is registered successfully',
    DB_SEED_SUCCESS: 'DB seeded with sample data.',
  },
} as const satisfies Record<string, ResponseMessages>;

const Lang: ResponseMessages =
  responseMessages[process.env.SYSTEM_LANGUAGE || 'EN'] || responseMessages.EN;

export default Lang;
