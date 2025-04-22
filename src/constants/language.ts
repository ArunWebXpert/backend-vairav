interface ResponseMessages {
  readonly API_HIT_ERROR: string;
  readonly DATA_FETCH_ERROR: string;
  readonly SUCCESS: string;
}

const responseMessages = {
  EN: {
    API_HIT_ERROR: 'Web hose api hit failed.',
    DATA_FETCH_ERROR: 'Error fetching data.',
    SUCCESS: 'success',
  },
} as const satisfies Record<string, ResponseMessages>;

export default responseMessages[process.env.SYSTEM_LANGUAGE || 'EN'] ||
  responseMessages.EN;
