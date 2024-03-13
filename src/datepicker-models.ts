export interface externalDaySettings {
  class: string;
  isEnabled: boolean;
}

export interface selectedDateContext {
  selectedDates: Array<Date | null>;
  datepickerMode: string;
}
