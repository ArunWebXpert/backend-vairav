interface ResponseMessages {
  API_HIT_ERROR: string;
  DATA_FETCH_ERROR: string;
  SUCCESS: string;
}

const responseMessages: { [key: string]: ResponseMessages } = {
  FR: {
    SUCCESS: 'succès',
    API_HIT_ERROR: "Échec de l'appel à l'API Web hose.",
    DATA_FETCH_ERROR: 'Erreur de récupération des données.',
  },
  EN: {
    API_HIT_ERROR: 'Web hose api hit failed.',
    DATA_FETCH_ERROR: 'Error fetching data.',
    SUCCESS: 'success',
  },
};

const systemLanguage = process.env.SYSTEM_LANGUAGE || 'EN';

const Lang: ResponseMessages =
  systemLanguage === 'EN' ? responseMessages.EN : responseMessages.FR;

export default Lang;
