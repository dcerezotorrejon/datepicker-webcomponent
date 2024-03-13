import { Component, Prop, h, Watch, Element, State, Event, EventEmitter, Method, Fragment, Listen } from '@stencil/core';
import * as CalendarUtils from './datepicker-utils/utils';
import * as CalendarTypes from './datepicker-models';
import { DatepickerContants } from './datepicker-constants';

@Component({
  tag: 'date-picker',
  styleUrl: 'datepicker.scss',
  shadow: true,
})
export class Datepicker {
  /**
   * The first name
   */
  @Prop({ reflect: true, mutable: true }) public mode: string = DatepickerContants.modes.SINGLE;
  @Prop({ reflect: true }) public showMonths = 1;
  @Prop({ reflect: true }) public startWeekDay = 0;
  @Prop({ reflect: true }) public locale = DatepickerContants.DEFAULT_LOCALE;
  @Prop({ reflect: true, mutable: true }) public open: boolean = false;
  @Prop({ reflect: false, mutable: true }) public minDate: Date = new Date();
  @Prop({ reflect: false, mutable: true }) public maxDate: Date = new Date(new Date().setFullYear(this.minDate.getFullYear() + 1));
  @Prop({ reflect: false, mutable: true }) public onDayRender?: (configObj: CalendarTypes.externalDaySettings, day: Date | null) => CalendarTypes.externalDaySettings;
  @Prop({ reflect: false, mutable: true }) public selectedDates: Array<Date | null> = [];
  @Prop({ reflect: true }) public dateFormat: string = DatepickerContants.DEFAULT_DATE_FORMAT;
  @Prop({ reflect: true }) public inputStartSelector?: string;
  @Prop({ reflect: true }) public inputEndSelector?: string;
  @Prop({ reflect: true }) public openOnFocus?: boolean;
  @Prop({ attribute: 'aria-expanded', reflect: true, mutable: true }) public expanded: string = 'false';
  @Prop({ attribute: 'role', reflect: true }) public role: string = 'widget';

  /* State object properties */
  @State() private currentMonthObject: Date = new Date(this.minDate.getFullYear(), this.minDate.getMonth());

  /* Private properties */
  @Element() private readonly element: HTMLElement;
  private inputStart: HTMLInputElement | null;
  private inputEnd: HTMLInputElement | null;
  private latestFocusedInput: string | null = DatepickerContants.RANGE_INPUTS.START;

  @Listen('click', { target: 'document' })
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const isInsideDatepicker = target?.closest('date-picker');
    if (this.open && target !== this.inputStart && target !== this.inputEnd && isInsideDatepicker === null) {
      this.closeDatepicker();
    }
  }

  @Event({
    eventName: 'selectedDate',
    composed: true,
    cancelable: false,
    bubbles: false,
  })
  onSelectedDateEventEmiter: EventEmitter<CalendarTypes.selectedDateContext>;

  @Event({
    eventName: 'rendered',
    composed: true,
    cancelable: false,
    bubbles: false,
  })
  onRenderEventEmmiter: EventEmitter<void>;

  /* Input events handlers */
  private readonly handleInputStartChange = (event: Event): void => {
    event.preventDefault();
    const inputValue = this.inputStart?.value ?? '';
    const parsedStart = CalendarUtils.parseDateStr(inputValue, this.dateFormat);
    const isBeforeEndDateSelected = this.selectedDates[1] == null || this.selectedDates[1] >= parsedStart;
    const isStartInDateRange = parsedStart >= this.minDate && parsedStart <= this.maxDate;
    if (this.selectedDates[0]?.getTime() !== parsedStart.getDate() && isStartInDateRange && isBeforeEndDateSelected) {
      this.selectedDates[0] = parsedStart;
      this.selectedDates = [...this.selectedDates];
      if (this.selectedDates[0] != null) {
        this.currentMonthObject = new Date(this.selectedDates[0].getFullYear(), this.selectedDates[0].getMonth());
      }
      this.onSelectedDateEventEmiter.emit({ selectedDates: this.selectedDates, datepickerMode: this.mode });
    }
  };

  private readonly handleInputEndChange = (event: Event): void => {
    event.preventDefault();
    const inputValue = this.inputEnd?.value ?? '';
    const parsedEnd = CalendarUtils.parseDateStr(inputValue, this.dateFormat);
    const isBeforeEndDateSelected = this.selectedDates[0] == null || this.selectedDates[0] <= parsedEnd;
    const isEndInDateRange = parsedEnd >= this.minDate && parsedEnd <= this.maxDate;
    if (this.selectedDates[1]?.getTime() !== parsedEnd.getDate() && isEndInDateRange && isBeforeEndDateSelected) {
      this.selectedDates[1] = parsedEnd;
      this.selectedDates = [...this.selectedDates];
      if (this.selectedDates[1] != null) {
        this.currentMonthObject = new Date(this.selectedDates[1].getFullYear(), this.selectedDates[1].getMonth());
      }
      this.onSelectedDateEventEmiter.emit({ selectedDates: this.selectedDates, datepickerMode: this.mode });
    }
  };

  /* Input init */
  private initStartInput(): void {
    if (this.inputStartSelector != null) {
      this.inputStart = this.element.querySelector(this.inputStartSelector);
      if (this.inputStart != null) {
        this.inputStart.removeEventListener('change', this.handleInputStartChange);
        this.inputStart.addEventListener('change', this.handleInputStartChange);
        if (this.openOnFocus ?? false) {
          this.inputStart.removeEventListener('focus', this.onInputFocus);
          this.inputStart.addEventListener('focus', this.onInputFocus);
        } else {
          this.inputStart.removeEventListener('focus', this.onInputFocus);
        }
      }
    }
  }

  private initEndInput(): void {
    if (this.inputEndSelector != null) {
      this.inputEnd = this.element.querySelector(this.inputEndSelector);
      if (this.inputEnd != null) {
        this.inputEnd.removeEventListener('change', this.handleInputEndChange);
        this.inputEnd.addEventListener('change', this.handleInputEndChange);
        if (this.openOnFocus ?? false) {
          this.inputEnd.removeEventListener('focus', this.onInputEndFocus);
          this.inputEnd.addEventListener('focus', this.onInputEndFocus);
        } else {
          this.inputEnd.removeEventListener('focus', this.onInputEndFocus);
        }
      }
    }
  }

  private readonly onInputFocus = (event: Event): void => {
    event.preventDefault();
    this.latestFocusedInput = DatepickerContants.RANGE_INPUTS.START;
    this.openDatepicker();
  };

  private readonly onInputEndFocus = (): void => {
    this.latestFocusedInput = DatepickerContants.RANGE_INPUTS.END;
    this.openDatepicker();
  };

  /* Watches to control prop values */
  @Watch('maxDate')
  maxDateChanged(): void {
    if (this.maxDate?.getTime() < this.minDate?.getTime()) {
      this.maxDate = new Date(new Date().setFullYear(this.minDate.getFullYear() + 1));
      throw new Error(`End date cannot be lower than minDate date\n Beggin Date is currently: ${this.minDate.toDateString()}`);
    }
  }

  @Watch('minDate')
  minDateDateChanged(): void {
    if (this.minDate?.getTime() > this.maxDate?.getTime()) {
      this.minDate = new Date();
      throw new Error(`End date cannot be higher than minDate date\n End Date is currently: ${this.maxDate.toDateString()}`);
    } else {
      this.currentMonthObject = new Date(this.minDate.getFullYear(), this.minDate.getMonth());
    }
  }

  @Watch('inputStartSelector')
  inputStartSelectorChanged(): void {
    this.initStartInput();
  }

  @Watch('inputEndSelector')
  inputEndSelectorChanged(): void {
    this.initEndInput();
  }

  @Watch('openOnFocus')
  openFocusChange(): void {
    this.initStartInput();
    this.initEndInput();
  }

  @Watch('mode')
  modeToLowerCase(): void {
    this.mode = this.mode?.toLowerCase();
    if (this.mode === DatepickerContants.modes.RANGE && this.inputEndSelector == null) {
      this.mode = DatepickerContants.modes.SINGLE;
      throw new Error(`Input end selector is required in range mode`);
    } else {
      this.initStartInput();
      this.initEndInput();
    }
  }

  /* Methods */
  @Method()
  public async updateSelectedDates(dates: Date[]): Promise<void> {
    const datesToSet: Date[] = dates.filter((date: Date) => date.getTime() >= this.minDate.getTime() && date.getTime() <= this.maxDate.getTime());
    if (datesToSet.length > 0) {
      this.selectedDates = datesToSet;
      this.onSelectedDateEventEmiter.emit({ selectedDates: this.selectedDates, datepickerMode: this.mode });
      if (this.selectedDates[0] != null) {
        this.currentMonthObject = new Date(this.selectedDates[0].getFullYear(), this.selectedDates[0].getMonth());
      }
    } else {
      throw new Error(`Dates to set are not valid`);
    }
  }

  private readonly openDatepicker = (): void => {
    this.open = true;
    this.expanded = 'true';
  };

  private readonly closeDatepicker = (): void => {
    this.open = false;
    this.expanded = 'false';
  };

  /* lifecicle events */
  componentDidRender(): void {
    this.onRenderEventEmmiter.emit();
  }

  connectedCallback(): void {
    this.initStartInput();
    if (this.mode === DatepickerContants.modes.RANGE && this.inputEndSelector != null) {
      this.initEndInput();
    }
    (this.element.querySelectorAll('[slot]') ?? []).forEach(element => {
      element.removeAttribute('hidden');
    });
  }

  disconnectedCallback(): void {
    // Remove event listeners
    this.inputStart?.removeEventListener('change', this.handleInputStartChange);
    this.inputStart?.removeEventListener('focus', this.openDatepicker);
  }

  /* Render Functions */
  private renderWeekDay(): Element[] {
    const days: string[] = CalendarUtils.daysReordered(this.startWeekDay, this.locale);
    const renderDayBar = (): Element[] => {
      return days.map((day: string): Element => {
        return <span class="calendar-weekday-item">{day}</span>;
      });
    };

    return renderDayBar();
  }

  private readonly calculateDayClassSingleMode = (day: Date): string => {
    return this.selectedDates[0]?.getTime() === day.getTime() ? 'calendar-day-btn--selected' : 'calendar-day-btn--simple-hover';
  };

  private readonly calculateDayClassRangeMode = (day: Date): string => {
    const timeStart = this.selectedDates[0]?.getTime() ?? 0;
    const timeEnd = this.selectedDates[1]?.getTime() ?? 0;
    const dayTime = day.getTime();
    let classes = '';
    if (timeStart === dayTime) {
      classes += 'calendar-day-btn--range-start';
    } else if (timeEnd === dayTime) {
      classes += 'calendar-day-btn--range-end';
    } else if (timeStart < dayTime && timeEnd > dayTime && timeStart !== 0 && timeEnd !== 0) {
      classes += 'calendar-day-btn--range';
    }
    return classes;
  };

  private readonly calculateAdditionalDayClass = (day: Date): string => {
    const classFunction = {
      range: this.calculateDayClassRangeMode,
      default: this.calculateDayClassSingleMode,
    };
    return (classFunction?.[this.mode] ?? classFunction.default)(day);
  };

  private renderEmptyCell(): Element {
    return <div class="calendar-day"></div>;
  }

  private readonly calculateHover = (target: HTMLElement): void => {
    const targetDate: Date = target['data-date'];
    if (DatepickerContants.RANGE_INPUTS.START === this.latestFocusedInput) {
      const selectorType = this.calculateNextSelectingDateStartMode(targetDate);
      target.classList.add(selectorType === DatepickerContants.RANGE_INPUTS.START ? 'calendar-day-btn--range-hover-start' : 'calendar-day-btn--range-hover-end');
      this.calculateHoverRangeClass(selectorType, targetDate);
    } else {
      const selectorType = this.calculateNextSelectingDateEndMode(targetDate);
      target.classList.add(selectorType === DatepickerContants.RANGE_INPUTS.START ? 'calendar-day-btn--range-hover-start' : 'calendar-day-btn--range-hover-end');
      this.calculateHoverRangeClass(selectorType, targetDate);
    }
  };

  updateRangeHoverCell = (element: HTMLElement, selectorType: string, targetDate: Date): void => {
    const [selectedStart, selectedEnd] = this.selectedDates;
    const elementDate: Date = element['data-date'];
    if (
      (selectorType === DatepickerContants.RANGE_INPUTS.START && elementDate > targetDate && selectedEnd != null && elementDate < selectedEnd) ||
      (selectorType === DatepickerContants.RANGE_INPUTS.END && elementDate < targetDate && selectedStart != null && elementDate > selectedStart)
    ) {
      element.classList.add('calendar-day-btn--range-hover');
    }
  };

  private readonly calculateHoverRangeClass = (selectorType: string, targetDate: Date): void => {
    const elements = this.element.shadowRoot?.querySelectorAll('.calendar-day-btn') ?? [];
    elements.forEach((element: HTMLElement) => {
      this.updateRangeHoverCell(element, selectorType, targetDate);
    });
  };

  private onMouseOverDateCellRange(event: Event): void {
    let target = event.target as HTMLElement;
    target = target?.closest('button') ?? target;
    this.calculateHover(target);
  }

  private onMouseLeaveDateCellRange(): void {
    const elements =
      this.element.shadowRoot?.querySelectorAll('.calendar-day-btn--range-hover-start, .calendar-day-btn--range-hover-end, .calendar-day-btn--range-hover') ?? [];
    elements.forEach((element: HTMLElement) => {
      element.classList.remove('calendar-day-btn--range-hover-start', 'calendar-day-btn--range-hover-end', 'calendar-day-btn--range-hover');
    });
  }

  private renderDateCell(day: Date): Element {
    const { locale, selectedDayAction, calculateAdditionalDayClass, onMouseOverDateCellRange, onMouseLeaveDateCellRange, minDate, maxDate, onDayRender } = this;
    const isRange: boolean = this.mode === 'range';
    const ariaLabel = day?.toLocaleDateString(locale, { dateStyle: 'full' } as any);
    const onClick = selectedDayAction.bind(this, day);
    const onMouseOver = isRange ? onMouseOverDateCellRange.bind(this) : null;
    const onMouseLeave = isRange ? onMouseLeaveDateCellRange.bind(this) : null;
    const configObj: CalendarTypes.externalDaySettings = {
      class: `calendar-day-btn ${calculateAdditionalDayClass(day)}`,
      isEnabled: day != null && day >= minDate && day <= maxDate,
    };
    if (onDayRender != null) {
      onDayRender(configObj, day);
    }
    return (
      <div class="calendar-day">
        <button
          class={configObj.class}
          data-date={day}
          aria-label={ariaLabel}
          disabled={!configObj.isEnabled}
          onClick={onClick}
          onMouseEnter={onMouseOver}
          onMouseLeave={onMouseLeave}
        >
          <span>{day.getDate()}</span>
        </button>
      </div>
    );
  }

  private renderDayGrill(year: number, monthIndex: number): Element[] {
    const daysOffset = CalendarUtils.getMonthDaysOffset(year, monthIndex, this.startWeekDay);
    const daysInMonthNumber = CalendarUtils.daysInMonth(year, monthIndex);
    const elements: Array<Date | null> = [...Array(daysOffset).fill(null)];
    for (let i = 1; i <= daysInMonthNumber; i++) {
      elements.push(new Date(year, monthIndex, i));
    }
    return elements.map((day): Element => {
      return day !== null ? this.renderDateCell(day) : this.renderEmptyCell();
    });
  }

  private renderMonth(year: number, monthIndex: number): Element {
    const monthName: string = CalendarUtils.capitalizeString(new Date(year, monthIndex).toLocaleDateString(this.locale, { month: 'long' }));
    return (
      <div class="calendar-month" data-month-index={`${year}${monthIndex}`}>
        <div class="calendar-month-title">
          <span>{monthName}</span>
          <span>{year}</span>
        </div>
        <div class="calendar-weekday-bar">{this.renderWeekDay()}</div>
        <div class="calendar-month-grill">{this.renderDayGrill(year, monthIndex)}</div>
      </div>
    );
  }

  private renderCalendar(): Element[] {
    const renderCalendarMonths = (): Element[] => {
      const months: Element[] = [];
      const displayedMonths = this.showMonths >= 1 ? this.showMonths : 1;
      let renderYearIndex = this.currentMonthObject.getFullYear();
      let renderMonthIndex = this.currentMonthObject.getMonth();
      for (let i = 0; i < displayedMonths; i++) {
        months.push(this.renderMonth(renderYearIndex, renderMonthIndex));
        renderMonthIndex === 11 && renderYearIndex++;
        renderMonthIndex = ++renderMonthIndex % 12;
      }
      return months;
    };
    return (
      <div class="calendar-calendar" aria-label="Calendar datepicker">
        {this.renderLeftArrow()}
        {this.renderRightArrow()}
        {renderCalendarMonths()}
      </div>
    );
  }

  private arrowPreviousMonth(): void {
    const arrow: Element | null = this?.element?.shadowRoot?.querySelector('.calendar-arrow--left') ?? null;
    if (arrow != null) {
      this.currentMonthObject = new Date(this.currentMonthObject.setMonth(this.currentMonthObject.getMonth() - 1));
    }
  }

  private arrowNextMonth(): void {
    const arrow: Element | null = this?.element?.shadowRoot?.querySelector('.calendar-arrow--right') ?? null;
    if (arrow != null) {
      this.currentMonthObject = new Date(this.currentMonthObject.setMonth(this.currentMonthObject.getMonth() + 1));
    }
  }

  private renderLeftArrow(): Element {
    const enableArrow: boolean = this.currentMonthObject.getTime() > new Date(this.minDate.getFullYear(), this.minDate.getMonth()).getTime();
    return (
      <Fragment>
        {enableArrow && (
          <button class="calendar-arrow calendar-arrow--left" aria-label="Previous month" onClick={this.arrowPreviousMonth.bind(this)}>
            <span class=""></span>
          </button>
        )}
      </Fragment>
    );
  }

  private renderRightArrow(): Element {
    const enableArrow: boolean = this.currentMonthObject.getTime() < new Date(this.maxDate.getFullYear(), this.maxDate.getMonth() - (this.showMonths - 1)).getTime();
    return (
      <Fragment>
        {enableArrow && (
          <button class="calendar-arrow calendar-arrow--right" aria-label="Next month" onClick={this.arrowNextMonth.bind(this)}>
            <span class=""></span>
          </button>
        )}
      </Fragment>
    );
  }

  private readonly selectedSingleDay = (day: Date): void => {
    this.selectedDates = [day];
    if (this.inputStart != null) {
      this.inputStart.value = this.dateFormat == null ? day.toLocaleDateString(this.locale) : CalendarUtils.toFormatedDateString(day, this.dateFormat);
      this.closeDatepicker();
    }
  };

  private readonly selectStart = (day: Date): void => {
    const selectedEndDate = this.selectedDates[1];
    const formattedDate = this.dateFormat == null ? day.toLocaleDateString(this.locale) : CalendarUtils.toFormatedDateString(day, this.dateFormat);
    if (selectedEndDate != null && day <= selectedEndDate) {
      this.selectedDates = [day, selectedEndDate];
    } else {
      this.selectedDates = [day];
      this.inputEnd != null && (this.inputEnd.value = '');
    }
    this.inputStart != null && (this.inputStart.value = formattedDate);
  };

  private readonly selectEnd = (day: Date): void => {
    const selectedStartDate = this.selectedDates[0];
    const formattedDate = this.dateFormat == null ? day.toLocaleDateString(this.locale) : CalendarUtils.toFormatedDateString(day, this.dateFormat);
    if (selectedStartDate != null && day >= selectedStartDate) {
      this.selectedDates = [selectedStartDate, day];
    } else {
      this.selectedDates = [null, day];
      this.inputStart != null && (this.inputStart.value = '');
    }
    this.inputEnd != null && (this.inputEnd.value = formattedDate);
  };

  private readonly calculateNextSelectingDateStartMode = (day: Date): string => {
    const [selectedStart, selectedEnd] = this.selectedDates;
    if (selectedStart != null && day >= selectedStart && selectedEnd == null) {
      return DatepickerContants.RANGE_INPUTS.END;
    } else {
      return DatepickerContants.RANGE_INPUTS.START;
    }
  };

  private readonly calculateNextSelectingDateEndMode = (day: Date): string => {
    const [selectedStart, selectedEnd] = this.selectedDates;
    if (selectedEnd != null && day <= selectedEnd && selectedStart == null) {
      return DatepickerContants.RANGE_INPUTS.START;
    } else {
      return DatepickerContants.RANGE_INPUTS.END;
    }
  };

  private readonly selectingDateFromRangeEnd = (day: Date): void => {
    const nextSelectingDate = this.calculateNextSelectingDateEndMode(day);
    const action = {
      start: this.selectStart,
      end: this.selectEnd,
    };
    action[nextSelectingDate]?.call(this, day);
  };

  private readonly selectingDateFromRangeStart = (day: Date): void => {
    const nextSelectingDate = this.calculateNextSelectingDateStartMode(day);
    const action = {
      start: this.selectStart,
      end: this.selectEnd,
    };
    action[nextSelectingDate]?.call(this, day);
  };

  private readonly selectedRangeDates = (day: Date): void => {
    const { RANGE_INPUTS } = DatepickerContants;
    const rangeAction = {
      end: this.selectingDateFromRangeEnd,
      start: this.selectingDateFromRangeStart,
    };

    const selectedAction = rangeAction[this.latestFocusedInput ?? RANGE_INPUTS.START] ?? rangeAction.start;
    const commonActions = (): void => {
      const { selectedDates } = this;

      const [firstDate, secondDate] = selectedDates;
      if (firstDate != null && secondDate != null) {
        this.closeDatepicker();
      }
    };

    selectedAction(day);
    commonActions();
  };

  private selectedDayAction(day: Date): void {
    const actions = {
      range: this.selectedRangeDates,
      default: this.selectedSingleDay,
    };
    (actions?.[this.mode] ?? actions.default).call(this, day);
    this.onSelectedDateEventEmiter.emit({ selectedDates: this.selectedDates, datepickerMode: this.mode });
  }

  render(): Element[] {
    if (!this.open) {
      return <slot name="calendar-inputs"></slot>;
    }
    return (
      <Fragment>
        <slot name="calendar-inputs"></slot>
        <div class="calendar-general-container">
          <slot name="calendar-top"></slot>
          {this.renderCalendar()}
        </div>
      </Fragment>
    );
  }
  
}
