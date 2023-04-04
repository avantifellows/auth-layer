import { client } from "@/services/API/rootClient.js";
import {
  getSessionOccurrenceDataEndpoint,
  getSessionGroupIdEndpoint,
} from "@/services/API/endpoints.js";

export default {
  /**
   * Retrieves details about a particular session occurrence
   * @param {String} sessionId - the ID of the session whose data needs to be retrieved
   */
  getSessionOccurrenceData(sessionId) {
    const params = {
      session_id: sessionId,
    };
    return new Promise((resolve) => {
      client
        .get(getSessionOccurrenceDataEndpoint, { params })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) resolve([]);
          else {
            resolve({ error: error });
            throw new Error("Session API returned an error:", error);
          }
        });
    });
  },

  /**
   * Retrieves group ID associated with a session
   * @param {String} sessionId - the ID of the session whose group ID needs to be returned
   */

  getGroupId(sessionId) {
    return new Promise((resolve) => {
      client
        .get(`getSessionGroupIdEndpoint/${sessionId}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Session API returned an error:", error);
        });
    });
  },
};
