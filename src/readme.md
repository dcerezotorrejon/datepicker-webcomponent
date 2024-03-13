# ib-datepicker



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description    | Type                                                                                        | Default                                                                |
| -------------------- | ---------------------- | -------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `dateFormat`         | `date-format`          |                | `string`                                                                                    | `DatepickerContants.DEFAULT_DATE_FORMAT`                               |
| `inputEndSelector`   | `input-end-selector`   |                | `string \| undefined`                                                                       | `undefined`                                                            |
| `inputStartSelector` | `input-start-selector` |                | `string \| undefined`                                                                       | `undefined`                                                            |
| `locale`             | `locale`               |                | `string`                                                                                    | `DatepickerContants.DEFAULT_LOCALE`                                    |
| `maxDate`            | --                     |                | `Date`                                                                                      | `new Date(new Date().setFullYear(this.minDateDate.getFullYear() + 1))` |
| `minDateDate`        | --                     |                | `Date`                                                                                      | `new Date()`                                                           |
| `mode`               | `mode`                 | The first name | `string`                                                                                    | `DatepickerContants.modes.SINGLE`                                      |
| `onDayRender`        | --                     |                | `((configObj: externalDaySettings, day: Date \| null) => externalDaySettings) \| undefined` | `undefined`                                                            |
| `open`               | `open`                 |                | `boolean`                                                                                   | `false`                                                                |
| `openOnFocus`        | `open-on-focus`        |                | `boolean \| undefined`                                                                      | `undefined`                                                            |
| `selectedDates`      | --                     |                | `Date[]`                                                                                    | `[]`                                                                   |
| `showMonths`         | `show-months`          |                | `number`                                                                                    | `1`                                                                    |
| `startWeekDay`       | `start-week-day`       |                | `number`                                                                                    | `0`                                                                    |


## Events

| Event          | Description | Type                               |
| -------------- | ----------- | ---------------------------------- |
| `rendered`     |             | `CustomEvent<void>`                |
| `selectedDate` |             | `CustomEvent<selectedDateContext>` |


## Methods

### `updateSelectedDates(dates: Date[]) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
