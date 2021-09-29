/**
 * @typedef {number} TimezoneOffset
 * @typedef {{name: string, offset: TimezoneOffset}} Timezone
 */

import {html, LitElement, unsafeCSS} from 'lit';
import {Timezones} from "./data/Timezones";
import './components/vertzo-timezone-selector/TimezoneSelector';
import styles from './index.css';

export class Vertzo extends LitElement {
    static get styles() {
        return unsafeCSS(styles)
    }

    static get properties() {
        return {
            _list: {type: Array, state: true},
            _time: {type: Number, state: true},
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
        this._list = Object.keys(Timezones)
            .filter(offset=>parseInt(offset) !== this._timezoneOffset)
            .map(offset=>Timezones[offset]);

        const now = new Date();
        now.setSeconds(0);
        now.setMinutes(0);
        this.setTime(now.getTime());
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
        let currentTimezone = Timezones[this._timezoneOffset];
        return html`
            <header>
                <h1>Vertzo</h1>
            </header>
            <ul class="list">
                ${this._list.map(timezone=>{
            return html`<li class="list-item">
                            ${this.renderRow(timezone, this.renderTimeString(timezone))}
                        </li>`
                })}
                <li class="list-item">
                    ${this.renderRow(currentTimezone, this.renderTimeString(currentTimezone))}
                </li>
            </ul>    
            <aside>
                <button @click="${this.changeDate(-30)}">‹</button>
                <button @click="${this.changeDate(30)}">›</button>
            </aside>
        `;
    }

    /**
     *
     * @param {Timezone} timezone
     * @param timeSlot
     * @return {*}
     */
    renderRow(timezone, timeSlot) {
        return html`
            <div class="flex-col">
                <div class="flex-row" style="justify-content: space-between; flex-wrap: wrap">
                    <span class="time-hm">${timeSlot}</span>
                    <span class="time-zone">${timezone.name}</span>
                    <span class="time-date">${this.getDateByTimezone(timezone.offset).toLocaleDateString()}</span>
                </div>
            </div>
        `;
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
