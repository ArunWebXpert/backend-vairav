import { ROLE } from '@constants/enum/role.enum';

export const getSourceFilter = (role: ROLE) => {
  const match: { [key: string]: any } = [ROLE.APACHE, ROLE.NGINX].includes(role)
    ? { source: role }
    : {};

  return match;
};
