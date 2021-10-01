import {html, LitElement, unsafeCSS} from 'lit';
import {TimezoneMap, Timezones} from "./data/TimezoneMap";
import './components/vertzo-timezone-selector/TimezoneSelector';
import styles from './index.css';
import { live } from 'lit/directives/live.js';

export class Vertzo extends LitElement {
    static get styles() {
        return unsafeCSS(styles)
    }

    static get properties() {
        return {
            _list: {type: Array, state: true},
            _time: {type: Number, state: true},
            _hideSelectTimezone : {type: Boolean, state: true},
            _renames :{type: Object, state: true}
        }
    }

    constructor() {
        super();

        this._timezoneOffset = new Date().getTimezoneOffset();

        /**
         *
         * @type {Timezone[]}
         * @private
         */
        this._list = [];

        const now = new Date();
        now.setSeconds(0);
        now.setMinutes(0);
        this.setTime(now.getTime());

        this._hideSelectTimezone = true;
        this._renames = {}
    }

    /**
     * @param {Number} time
     */
    setTime(time) {
        this._time = time;
    }

    /**
     * @return {Number}
     */
    getTime() {
        return this._time;
    }

    render() {
        let currentTimezone = TimezoneMap[this._timezoneOffset];
        return html`
            <header>
                <h1>Vertzo</h1>
            </header>
            <main>
            <ul class="list">
                ${this._list.map((timezone, index)=>{
                    return html`<li class="list-item">
                                ${this.renderRow(this.renderTimeString(timezone), timezone, index)}
                            </li>`
                })}
            </ul>
            <button @click="${(this.addNewTimezoneToList())}">Add more</button>
                
            </main>
                
            <aside>
                <button @click="${this.changeDate(-30)}">‹</button>
                <button @click="${this.changeDate(30)}">›</button>
                
            </aside>
        `;
    }

    addNewTimezoneToList() {
        return ()=>{
            this._list = [...this._list, TimezoneMap[this._timezoneOffset]]
        }
    }

    /**
     *
     * @param timeSlot
     * @param {Timezone} timezone
     * @return {*}
     */
    renderRow(timeSlot, timezone, index) {
        return html`
            <div class="flex-row" style="justify-content: space-between; flex-wrap: nowrap; gap: 1rem">
                <div class="flex-col">
                    <span class="time-hm" style="white-space: nowrap">${timeSlot}</span>
                    <span class="time-date">${this.getDateByTimezone(timezone.offset).toLocaleDateString()}</span>
                </div>
                <div class="time-zone" style="display: flex; flex-wrap: nowrap; gap: 3px">
                    <span class="single-line" contenteditable="true" @blur="${(this.renameTimezone(timezone))}" .textContent="${live(this.getTimezoneName(timezone))}"></span>
                    <div>
                        ${this._hideSelectTimezone
                            ? html`<span @click="${(this.hideSelectTimezone(false))}">${timezone.utc}</span>`
                            : html`<select @change="${this.onTimezoneChange(this.updateTimezoneAtIndex(index))}" @focusout="${this.hideSelectTimezone(true)}">
                                                       ${Timezones.map((_timezone, index)=>html`<option value="${index}" ?selected="${_timezone.name === timezone.name}">${_timezone.utc}</option>`)}
                                                    </select>`
                        }
                    </div>
                </div>
            </div>
            
        `;
    }

    renameTimezone(timezone) {
        return event=>{
            const newValue = event.target.textContent || timezone.tzCode;
            this._renames = {
                ...this._renames,
                [timezone.offset] : newValue
            };
        }
    }

    getTimezoneName(timezone) {
        return this._renames[timezone.offset] || timezone.tzCode;
    }

    updateTimezoneAtIndex(listIndex) {
        return (selectedTimezoneIndex) => {
            this._list = [...this._list.map((_timezone, _listIndex)=>{
                if(_listIndex === listIndex){
                    return  Timezones[selectedTimezoneIndex];
                }
                return _timezone;
            })];
        };
    }

    onTimezoneChange(updateTimezone) {
        return event=>updateTimezone(event.target.value);
    }

    hideSelectTimezone(value) {
        return () => this._hideSelectTimezone = value;
    }

    /**
     *
     * @param {Timezone} timezone
     * @return {*}
     */
    renderTimeString(timezone) {
        return html`${this.getFormattedTimeString(timezone)}`;
    }

    changeDate( diffInMinutes = 30) {
        return () => {
            this.setTime(this.getTime() + diffInMinutes * 60000);
        }
    }

    /**
     * Returns formatted Time String in a timezone
     * @param {Timezone} timezone
     * @return {string}
     */
    getFormattedTimeString(timezone) {
        const date = this.getDateByTimezone(timezone.offset)
        const HH = `0${(this.convertHrsTo12HrFormat(date.getHours()))}`.slice(-2);
        const MM = `0${date.getMinutes()}`.slice(-2);
        const AM_PM = date.getHours()>11?'PM':'AM';
        return `${HH}:${MM} ${AM_PM}`;
    }

    /**
     * Return date for this._time as per target timezone offset
     * @param {TimezoneOffset} targetTimezoneOffset
     * @return {Date}
     */
    getDateByTimezone(targetTimezoneOffset) {
        let date;
        if(targetTimezoneOffset === this._timezoneOffset){
            date = new Date(this.getTime());
        } else {
            // Moving to UTC timezone
            const utcTime = this.getTime() + (this._timezoneOffset * 60 * 1000);

            // Moving from UTC timezone
            const targetTimezoneTime = utcTime + (-(targetTimezoneOffset) * 60 * 1000);
            date = new Date(targetTimezoneTime);
        }

        return date;
    }

    /**
     *
     * @param {Number} hours
     * @return {number|*}
     */
    convertHrsTo12HrFormat(hours) {
        return (hours > 12)  ? hours % 12 : ((hours === 0)?12: hours);
    }
}

customElements.define('vertzo-app', Vertzo);
