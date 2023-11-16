type UserAttributes = {
  'custom:dob': string;
  'custom:firstName': string;
  'custom:gender': string;
  'custom:lastName': string;
  'custom:nationality': string;
  'custom:country': string;
  'custom:avatar': string;
  preferred_username: string;
  email: string;
};

export const parseAttributes = (attributes: UserAttributes) => {
  if (!attributes) {
    return {};
  }
  const user = {
    dob: attributes['custom:dob'],
    firstName: attributes['custom:firstName'],
    gender: attributes['custom:gender'],
    lastName: attributes['custom:lastName'],
    nationality: attributes['custom:nationality'],
    email: attributes.email,
    userName: attributes['preferred_username'],
    country: attributes['custom:country'],
    avatar: attributes['custom:avatar'],
  };
  return user;
};
