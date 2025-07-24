// 📁 src/config/auth.js
export const TOKEN_CONFIG = {
  // Token temporaire pour les tests - À CENTRALISER

  TEMP_TOKEN: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUUll0aUpNY2c1aUF1UV9YUG9tZ3ZnWVBBeTc0dDJoalBUa09pUDY2X053In0.eyJleHAiOjE3NTMzNzI0MDcsImlhdCI6MTc1MzM3MjEwNywianRpIjoiNWZhYjhjZjctYmQ3NC00MDY0LTg5YTEtZjBlN2RhMzA3YzJiIiwiaXNzIjoiaHR0cHM6Ly9hY2Nlc3MtZHkucm1hYXNzdXJhbmNlLmNvbS9hdXRoL3JlYWxtcy9ybWEtYWQiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiY2M3ZWViN2QtMmU1NC00YWI1LWExNTUtM2U3NTAxNmY3ZGQwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibm92YXMiLCJzZXNzaW9uX3N0YXRlIjoiYjk2M2M1NTAtZDU0Mi00NTI1LWE3NzUtNzRjODQ5ODc2ZjIzIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXJtYS1hZCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctdXNlcnMiLCJxdWVyeS1ncm91cHMiLCJxdWVyeS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwic2lkIjoiYjk2M2M1NTAtZDU0Mi00NTI1LWE3NzUtNzRjODQ5ODc2ZjIzIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiWmluZWIgSEFSUkFHVUkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzMDAwMTQ5NSIsImdpdmVuX25hbWUiOiJaaW5lYiIsImZhbWlseV9uYW1lIjoiSEFSUkFHVUkiLCJlbWFpbCI6InouaGFycmFndWlAcm1hYXNzdXJhbmNlLmNvbSJ9.lpagAEz34SLT4VGWbrjigzl21biE_REDwo_H3UeGUpC4PxJBgq5krYBfBIwqjvIA11Uqot9CrU9mzSnCgtrjPSLnvlYPWA00qKEr0KHt1B6I4XOXME6-yd6vqFLvyT4MY8Wdx0xRb9QBbTJT_skT_A5t7w0NFz_uV8gngNhGMUZmx_rc6k9FiY_hn8Nc9hwE9OFVgYSHzZCsqJRIzVYhDhY3xfn5GNgjNXidsUXC_MBLt88ftI2Uj2m77cKWvy0_6uY9nw2iHWaGDxfbDawFNAlZ9lqG5RNK1PUgdfImyLEHf_9UsDpIXwItmWroHCwYs_YlV8Pj2y0iH_ZSdClGkQ"

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