// 📁 src/config/auth.js
export const TOKEN_CONFIG = {
  // Token temporaire pour les tests - À CENTRALISER

  TEMP_TOKEN: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUUll0aUpNY2c1aUF1UV9YUG9tZ3ZnWVBBeTc0dDJoalBUa09pUDY2X053In0.eyJleHAiOjE3NTQ2NTI2NjUsImlhdCI6MTc1NDY1MjM2NSwianRpIjoiMjExMjI5ODQtNmFlNy00Mzk1LWI2MmItYzIyNDE5NzA4MmRiIiwiaXNzIjoiaHR0cHM6Ly9hY2Nlc3MtZHkucm1hYXNzdXJhbmNlLmNvbS9hdXRoL3JlYWxtcy9ybWEtYWQiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiY2M3ZWViN2QtMmU1NC00YWI1LWExNTUtM2U3NTAxNmY3ZGQwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibm92YXMiLCJzZXNzaW9uX3N0YXRlIjoiMzJlMjcyMzYtZDU2MC00YjM4LWIwYWMtMmRjYzAxNGRjNGIwIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXJtYS1hZCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctdXNlcnMiLCJxdWVyeS1ncm91cHMiLCJxdWVyeS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwic2lkIjoiMzJlMjcyMzYtZDU2MC00YjM4LWIwYWMtMmRjYzAxNGRjNGIwIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiWmluZWIgSEFSUkFHVUkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzMDAwMTQ5NSIsImdpdmVuX25hbWUiOiJaaW5lYiIsImZhbWlseV9uYW1lIjoiSEFSUkFHVUkiLCJlbWFpbCI6InouaGFycmFndWlAcm1hYXNzdXJhbmNlLmNvbSJ9.YMaLdSkEvKyGIyHmosncOVL2QGpE_VnjYLp_G_wdn8GJGzfKsfY7GodhtrZv4dk1GLH9cDBSu5QfhSpN7TGencyVKlxuhhEl_2wsfKCj9xb_NOrUS3ab2NPk0DbxS2YmSKIJb45LK2GkbPS6iLQuk-SIB1rzA0_Blhss9QYq1xIuTsGpZZvGWKcAK3aPg8PjMIeBCEVkdpW37_k5I-50NY5TkPSwil69c5yYeKDE0Amot51wHqaPKq0naTPF2SUpbxJJ8lXG50vWxzcbseGxsE7pjSjCdwJF1_5d1z4jv5ncqW8WUtocMVmtgBUik1sz5Rnd3b70z1BGqCRuHusD3A"

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