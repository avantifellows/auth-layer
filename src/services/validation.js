import firebaseAPI from "@/services/API/checkUser.js";

export async function validateSRN(userID, validateCount, isUserValid){
    // this function is invoked only for the check of SRN's.
    // validateCount = 0, when the user gets validated on the first try
    // validateCount = 1, when the user fails the first check
    // validateCount = 2, when user fails the second check as well -> letting the user go through irrespective.
    
    var invalidLoginMessage = ""

    isUserValid = await firebaseAPI.checkUserExists(userID);
    if(isUserValid){
        return {
            isUserValid: isUserValid,
            validateCount: validateCount,
            invalidLoginMessage: invalidLoginMessage
            }
        }


    // this condition checks if the user is getting authenticated the first time. Just shows an error message.
    if (!isUserValid && validateCount == 0) {
        validateCount = 1;
        invalidLoginMessage = "Please enter correct SRN / कृपया सही SRN दर्ज करें";
    }
    // this condition checks if the user is getting authenticated the second time. 
    else if(!isUserValid && validateCount == 1){
        validateCount = 2;
    }
    return {
        isUserValid: isUserValid,
        validateCount: validateCount,
        invalidLoginMessage: invalidLoginMessage
    }
}
