import { sendSQSMessage } from "@/services/API/sqs";

/** This function is called when a user has to be redirected to the destination. Depending on the destination, the destination URL is built.
 * @param {String} purposeParams - extracted from auth layer URL
 * @param {Array} userIDList - list of userIDs wanting to go through the layer
 * @param {String} redirectID - extracted from auth layer URL
 * @param {String} redirectTo - extracted from auth layer URL
 * @param {String} authType - extracted from auth layer URL
 */

export function redirectToDestination(
  purposeParams,
  userIDList,
  redirectID,
  redirectTo,
  authType,
  group
) {
  let redirectURL = "";
  let fullURL = "";
  let finalURLQueryParams = "";
  let userID = userIDList[0]["userID"];

  switch (redirectTo) {
    case "plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_PLIO;
      let url = new URL(redirectURL + redirectID);
      finalURLQueryParams = new URLSearchParams({
        api_key: import.meta.env.VITE_APP_PLIO_AF_API_KEY,
        unique_id: userID,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "meet": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_MEET;
      fullURL = new URL(redirectURL + redirectID);
      break;
    }
    case "zoom": {
      fullURL = redirectID;
      break;
    }
    case "youtube": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_YOUTUBE;
      fullURL = new URL(redirectURL + redirectID);
      break;
    }
    case "teacher-web-app": {
      finalURLQueryParams = new URLSearchParams({
        teacherID: userID,
        groupName: group,
      });
      fullURL = redirectID + "?" + finalURLQueryParams;
      break;
    }
    default: {
      var purpose = "Error";
      sendSQSMessage(
        purpose,
        purposeParams,
        redirectTo,
        redirectID,
        userIDList,
        authType
      );
      return false;
    }
  }

  window.open(fullURL, "_self");
  return true;
}
