// 📁 src/config/auth.js
export const TOKEN_CONFIG = {
  // Token temporaire pour les tests - À CENTRALISER

  TEMP_TOKEN: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUUll0aUpNY2c1aUF1UV9YUG9tZ3ZnWVBBeTc0dDJoalBUa09pUDY2X053In0.eyJleHAiOjE3NTQ1MDAyODAsImlhdCI6MTc1NDQ5OTk4MCwianRpIjoiYjlmZmM4OGItODg1YS00ZjM4LWE0NjctODg0YWZhOWUwNGIwIiwiaXNzIjoiaHR0cHM6Ly9hY2Nlc3MtZHkucm1hYXNzdXJhbmNlLmNvbS9hdXRoL3JlYWxtcy9ybWEtYWQiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiY2M3ZWViN2QtMmU1NC00YWI1LWExNTUtM2U3NTAxNmY3ZGQwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibm92YXMiLCJzZXNzaW9uX3N0YXRlIjoiYjM1YjdmYjAtN2I4Ny00NGM5LTkyNmItMzA2Y2EzNjI4MzM5IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXJtYS1hZCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctdXNlcnMiLCJxdWVyeS1ncm91cHMiLCJxdWVyeS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwic2lkIjoiYjM1YjdmYjAtN2I4Ny00NGM5LTkyNmItMzA2Y2EzNjI4MzM5IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiWmluZWIgSEFSUkFHVUkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzMDAwMTQ5NSIsImdpdmVuX25hbWUiOiJaaW5lYiIsImZhbWlseV9uYW1lIjoiSEFSUkFHVUkiLCJlbWFpbCI6InouaGFycmFndWlAcm1hYXNzdXJhbmNlLmNvbSJ9.KLyu3MU6bLpHgTotkunGv3Q4EChO3JFa5M12fKT6aXhSryCiAcQKshjoVPIeBroxYLpev27EJD0KgPwx9Y5X20egygQIBM5-3Q0KwyS8juQRfzrGQn3PRunjoInk4GR1706udqzPOGWV8oPF-wVLjNQnFBGYsgbwC3q8BmcLnSt0UhKJTT82HpWHLvIEuGhmiWHMTRqtSXunzNzq6t_i3hpzcaJOgkUbEtb3FhBYuh1f2xK_uR9B2J4HUP8dF0lhcfTjPESxfcaHHuIF9Hv6xccoJ5iAIf-2TEovhe5c5tje6hBsMj17_mw2UtDlibyWl_ket7eC9biZAtFsyaR9Ww"

}
/**
 * Récupère le token d'authentification
 * Priorité: localStorage -> TOKEN temporaire
 * @returns {string|null} Token JWT
 */
export const getAuthToken = () => {
  // Vérifier si localStorage est disponible (environnement navigateur)
  if (typeof Storage !== "undefined") {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      return storedToken;
    }
  }
  
  // Fallback sur le token temporaire
  return TOKEN_CONFIG.TEMP_TOKEN;
};

/**
 * Sauvegarde le token d'authentification
 * @param {string} token - Token JWT à sauvegarder
 */
export const setAuthToken = (token) => {
  if (token && typeof Storage !== "undefined") {
    localStorage.setItem('access_token', token);
    console.log('🔑 Token sauvegardé dans localStorage');
  } else if (token) {
    console.warn('⚠️ localStorage non disponible, token non sauvegardé');
  }
};

/**
 * Supprime le token d'authentification
 */
export const clearAuthToken = () => {
  if (typeof Storage !== "undefined") {
    localStorage.removeItem('access_token');
    console.log('🔑 Token supprimé du localStorage');
  }
};

/**
 * Vérifie si le token est valide et non expiré
 * @param {string} token - Token JWT à vérifier
 * @returns {boolean} true si le token est valide
 */
export const isTokenValid = (token) => {
  if (!token) {
    console.warn('⚠️ Token absent');
    return false;
  }
  
  try {
    // Décoder le payload du JWT (partie centrale)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp > currentTime) {
      console.log('✅ Token valide');
      return true;
    } else {
      console.warn('⚠️ Token expiré');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la validation du token:', error);
    return false;
  }
};

/**
 * Récupère les informations utilisateur depuis le token
 * @param {string} token - Token JWT
 * @returns {object|null} Informations utilisateur ou null
 */
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
    console.error('❌ Erreur lors de l\'extraction des infos utilisateur:', error);
    return null;
  }
};