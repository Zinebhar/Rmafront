export const TOKEN_CONFIG = {
  TEMP_TOKEN: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUUll0aUpNY2c1aUF1UV9YUG9tZ3ZnWVBBeTc0dDJoalBUa09pUDY2X053In0.eyJleHAiOjE3NTYxMzIyMjYsImlhdCI6MTc1NjEzMTkyNiwianRpIjoiMDdkYmQ3OWEtMmUwYy00ZWNmLWE4ZTQtNjhmOGFmYjA2YWYwIiwiaXNzIjoiaHR0cHM6Ly9hY2Nlc3MtZHkucm1hYXNzdXJhbmNlLmNvbS9hdXRoL3JlYWxtcy9ybWEtYWQiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiNDI2NzdmOTctODdkNy00NTVlLWI1ODktMDEzOGZjZDQyZWFjIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibm92YXMiLCJzZXNzaW9uX3N0YXRlIjoiMjc4MmE3NzAtMzlhYy00ZTIxLTg0N2QtNmM5YWMxNTc1YWU5IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXJtYS1hZCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctdXNlcnMiLCJxdWVyeS1ncm91cHMiLCJxdWVyeS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwic2lkIjoiMjc4MmE3NzAtMzlhYy00ZTIxLTg0N2QtNmM5YWMxNTc1YWU5IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiSW1hbmUgRUwgQUxKSSIsInByZWZlcnJlZF91c2VybmFtZSI6InMwMDAxNDk0IiwiZ2l2ZW5fbmFtZSI6IkltYW5lIiwiZmFtaWx5X25hbWUiOiJFTCBBTEpJIiwiZW1haWwiOiJpLmVsYWxqaUBybWFhc3N1cmFuY2UuY29tIn0.A3aXZp-ryF3rOGVaNZWBTLZ3VnZQn34GZzCuMxn-71O0uIUCcXo581M6l8hM4Hi8NU1RPQFwDYxtGOHnMNETQqc3xaFu2ItAmG3uZiwME2gMmMbsGpDwIjjsJ5bM6zZaZyTyiN6o27HS5JMs0olNkjFskCmthlop7fierDBC9w3zsc57h3hRBlCQPqQQ-qTH74A8BbpZCCTfBKgMbpdIVtrCpBHrSBYC7GOwGJdoMihz8TQpKWmuB-_aDlBNc90Y5CcEu0oz_cPhdDxBtgGQgOAxDKxk3tWPHsBsenC8t69shwpB2IpxrO8Ch-Rt1xp9LGjpNLxpAsX5IxyxaCk_yg"
}

export const getAuthToken = () => {
  if (typeof Storage !== "undefined") {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      return storedToken;
    }
  }
    return TOKEN_CONFIG.TEMP_TOKEN;
};

export const setAuthToken = (token) => {
  if (token && typeof Storage !== "undefined") {
    localStorage.setItem('access_token', token);
    console.log('Token sauvegardé dans localStorage');
  } else if (token) {
    console.warn('localStorage non disponible, token non sauvegardé');
  }
};


export const clearAuthToken = () => {
  if (typeof Storage !== "undefined") {
    localStorage.removeItem('access_token');
    console.log('Token supprimé du localStorage');
  }
};

export const isTokenValid = (token) => {
  if (!token) {
    console.warn('Token absent');
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp > currentTime) {
      console.log('Token valide');
      return true;
    } else {
      console.warn('Token expiré');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    return false;
  }
};


export const getUserInfoFromToken = (token) => {
  if (!token || !isTokenValid(token)) {
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.preferred_username,
      email: payload.email,
      name: payload.name,
      givenName: payload.given_name,
      familyName: payload.family_name,
      roles: payload.realm_access?.roles || []
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction des infos utilisateur:', error);
    return null;
  }
};