<template>
  <div class="">
    <LocalePicker :options="getLocaleOptions" />
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-black font-bold">
        {{ getFormHeading }}
      </h2>
    </div>

    <div class="mx-auto w-64">
      <component
        v-for="(formField, index) in formSchemaData"
        :show="formField.show"
        :key="index"
        :is="formField.component"
        :label="formField.label[getLocale]"
        :isRequired="formField.required"
        :multipleSelect="formField.multipleSelect === true"
        :dbKey="formField.key"
        :defaultValue="formField.defaultValue"
        :options="formField.options[getLocale]"
        :multiple="formField.multiple"
        :maxLengthOfEntry="formField.maxLengthOfEntry"
        :helpText="formField.helpText[getLocale]"
        @update="updateUserData"
        class="mt-[25px]"
      />

      <button
        class="mt-[20px] w-full bg-primary disabled:bg-primary-hover hover:bg-primary-hover text-white mx-auto shadow-md p-2 rounded"
        :disabled="buttonDisabled"
        @click="profileDetails"
        v-html="startSessionText"
      />
    </div>
  </div>
</template>
<script>
import useAssets from "@/assets/assets.js";
import FormSchemaAPI from "@/services/API/form.js";
import UserAPI from "@/services/API/user.js";
import { typeToInputParameters } from "@/services/authToInputParameters";
import { redirectToDestination } from "@/services/redirectToDestination";
import { sendSQSMessage } from "@/services/API/sqs";
import LocalePicker from "../components/LocalePicker.vue";
import { useToast } from "vue-toastification";

const assets = useAssets();

export default {
  name: "Information Form",
  components: { LocalePicker },
  data() {
    return {
      AFLogo: assets.AFLogoSvg,
      formSchemaData: {}, // contains data about the form schema
      buttonDisabled: true,
      userData: {}, // contains data entered by user
      toast: useToast(),
    };
  },
  props: {
    id: {
      type: String,
      default: "",
    },
  },
  async created() {
    /** Fetches all the fields that need to be filled by the student
    /* Also, maps each field to its input component
    */
    this.formSchemaData = await FormSchemaAPI.getFormFields(
      this.$store.state.sessionData.meta_data.number_of_fields_in_popup_form,
      this.$store.state.sessionData.popup_form_id,
      this.id
    );
    if (this.formSchemaData.error) {
      this.toast.error("Unable to fetch form!", {
        position: "top-center",
        timeout: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      });
    }
    if (Object.keys(this.formSchemaData).length == 0) {
      this.buttonDisabled = false;
      this.redirect();
    }
    Object.keys(this.formSchemaData).forEach((field) => {
      this.formSchemaData[field]["component"] =
        typeToInputParameters[this.formSchemaData[field].type];
      this.formSchemaData[field]["show"] =
        this.formSchemaData[field].showBasedOn == "" &&
        !this.formSchemaData[field].dependant
          ? true
          : false;
      this.formSchemaData[field]["required"] =
        this.formSchemaData[field].required == "TRUE" ? true : false;
      this.formSchemaData[field]["multipleSelect"] =
        this.formSchemaData[field].multipleSelect == "TRUE" ? true : false;
    });
    this.isUserDataIsComplete();
  },
  watch: {
    userData: {
      handler() {
        this.isUserDataIsComplete();
        this.showBasedOn();
        this.getOptions();
      },
      deep: true,
    },
  },
  computed: {
    getLocaleOptions() {
      return this.$store.state.authGroupData
        ? this.$store.state.authGroupData.locale.split(",")
        : ["English"];
    },

    /** Returns the locale selected by user */
    getLocale() {
      return this.$store.state.locale;
    },

    getFormHeading() {
      let formHeading = "";
      if (this.isUserDataIsComplete()) {
        formHeading = {
          en: "Thanks for completing your profile!",
          hi: "अपना प्रोफ़ाइल पूरा करने के लिए धन्यवाद"
        }
      } else {
        formHeading = {
        en: "Complete your Profile",
        hi: "अपनी प्रोफाइल पूर्ण करें",
      };
      }


      return formHeading[this.getLocale];
    },

    /** Returns button text */
    startSessionText() {
      if (this.getLocale == "en" && this.$store.state.redirection == true) {
        return "Start Session"
      }
      else if (this.getLocale == "hi" && this.$store.state.redirection == true) return "सत्र शुरू करें";
      else if (this.$store.state.redirection == false) return "No Session Available!"
    },
  },
  methods: {
    /** Returns if there any fields that have visibilty dependence on any other fields */
    showBasedOn() {
      return Object.keys(this.formSchemaData).forEach((field) => {
        let fieldAttributes = this.formSchemaData[field];
        let showBasedOn = fieldAttributes.showBasedOn;

        if (fieldAttributes.showBasedOn != "") {
          if (
            this.userData[showBasedOn.split("==")[0]] ==
            showBasedOn.split("==")[1]
          ) {
            fieldAttributes["show"] = true;
          } else fieldAttributes["show"] = false;
        }
        if (fieldAttributes.dependant) {
          if (
            fieldAttributes.dependantField in this.userData &&
            this.userData[fieldAttributes.dependantField] != ""
          ) {
            fieldAttributes["show"] = true;
          } else {
            fieldAttributes["show"] = false;
          }
        }
      });
    },

    /** Builds options for dependant fields */
    getOptions() {
      Object.keys(this.formSchemaData).forEach((field) => {
        let fieldAttributes = this.formSchemaData[field];
        if (fieldAttributes.dependant) {
          if (this.userData[fieldAttributes.dependantField]) {
            fieldAttributes["options"] =
              fieldAttributes.dependantFieldMapping[
                this.userData[fieldAttributes.dependantField]
              ];
            return fieldAttributes.options[this.getLocale];
          }
        }
      });
    },

    /** checks if user data has all the fields required */
    isUserDataIsComplete() {
      let isUserDataComplete = true;
      Object.keys(this.formSchemaData).forEach((field) => {
        if (
          (!this.userData.hasOwnProperty(this.formSchemaData[field].key) ||
            this.userData[this.formSchemaData[field].key] == "") &&
          this.formSchemaData[field].required &&
          this.formSchemaData[field].show
        ) {
          isUserDataComplete = false;
        }
      });

      if (isUserDataComplete && this.$store.state.redirection == true) {
        this.buttonDisabled = false;
      } else this.buttonDisabled = true;

      return isUserDataComplete;
    },

    /** updates user data based on user input */
    updateUserData(value, key) {
      this.userData[key] = value;
    },
    async profileDetails() {
      await UserAPI.studentData(
        this.userData,
        (this.userData["student_id"] = this.id)
      );
      this.redirect();
    },

    /** redirects to destination */
    redirect() {
      if (this.$store.state.redirection == false) {
        return; // no redirection
      }
      if (
        redirectToDestination(
          this.$store.state.sessionData.purpose.params,
          this.id,
          this.$store.state.platform_id,
          this.$store.state.platform_link,
          this.$store.state.platform,
          this.$store.state.authGroupData.input_schema.user_type
        )
      ) {
        UserAPI.postUserSessionActivity(
          this.id,
          "popup_form",
          this.$store.state.sessionData.session_id,
          this.$store.state.authGroupData.input_schema.user_type,
          this.$store.state.sessionData.session_occurrence_id
        );
        sendSQSMessage(
          "popup_form",
          this.$store.state.sessionData.purpose["sub-type"],
          this.$store.state.sessionData.platform,
          this.$store.state.sessionData.platform_id,
          this.id,
          "",
          this.$store.state.authGroupData.name,
          this.$store.state.authGroupData.input_schema.user_type,
          this.$store.state.sessionData.session_id,
          "",
          "phone" in this.userData ? this.userData["phone"] : "",
          this.$store.state.sessionData.meta_data.batch,
          "date_of_birth" in this.userData ? this.userData["date_of_birth"] : ""
        );
      }
    },
  },
};
</script>
