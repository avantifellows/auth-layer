import TextEntry from "@/components/TextEntry.vue";
import Datepicker from "@/components/Datepicker.vue";
import Dropdown from "@/components/Dropdown.vue";
import NumberEntry from "@/components/NumberEntry.vue";
import NewPhoneNumberEntry from "@/components/NewPhoneNumberEntry.vue";
import Upload from "@/components/Upload.vue";
import Checkbox from "@/components/Checkbox.vue";
import { shallowRef } from "vue";

export const authToInputParameters = {
  number: ["ID"],
  phoneNumber: ["PH"],
  date: ["DOB"],
};

export const typeToInputParameters = {
  text: shallowRef(TextEntry),
  number: shallowRef(NumberEntry),
  dropdown: shallowRef(Dropdown),
  date: shallowRef(Datepicker),
  phone: shallowRef(NewPhoneNumberEntry),
  upload: shallowRef(Upload),
  checkbox: shallowRef(Checkbox),
};
