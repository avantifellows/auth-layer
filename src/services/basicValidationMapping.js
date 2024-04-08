/** Function to check if the key pressed by user is a number.
 * @param {Object} event - event triggered when a character is typed
 */
function isNumeric(event) {
  return event.keyCode >= 48 && event.keyCode <= 57;
}

/** Function to check if the key pressed by user is a number or an alphabet.
 * @param {Object} event - event triggered when a character is typed
 */
function isAlphanumeric(event) {
  return (
    isNumeric(event) ||
    (event.keyCode >= 65 && event.keyCode <= 90) ||
    (event.keyCode >= 97 && event.keyCode <= 122)
  );
}

/** Function to check if the key pressed by user is an alphabet.
 * @param {Object} event - event triggered when a character is typed
 */
function isText(event) {
  return (
    (event.keyCode >= 65 && event.keyCode <= 90) ||
    (event.keyCode >= 97 && event.keyCode <= 122)
  );
}

/** Mapping between basicValidationType and the validation method to use */
export const validationTypeToFunctionMap = {
  numeric: isNumeric,
  alphanumeric: isAlphanumeric,
  text: isText,
  undefined: function () {
    return false;
  },
};
