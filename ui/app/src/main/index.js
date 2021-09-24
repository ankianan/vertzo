/**
 * @typedef {number} TimezoneOffset
 * @typedef {{name: string, offset: TimezoneOffset}} Timezone
 */

import {html, unsafeCSS, LitElement} from 'lit';
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
        this.setTime(now.getTime());
    }

    setTime(time) {
        this._time = time;
    }

    render() {
        let currentTimezone = Timezones[this._timezoneOffset];
        return html`
            <header>
                <h1 class="header">
                    Vertzo
                </h1>
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
                <button @click="${this.changeDate(30)}">›</button>
                <button @click="${this.changeDate(-30)}">‹</button>
            </aside>
        `;
    }

    /**
     *
     * @param item
     * @param timeSlot
     * @return {*}
     */
    renderRow(item, timeSlot) {
        return html`
            <div class="flex-col">
                <div class="flex-row list-item--title">
                    <span class="list-item--title time-hm">${timeSlot}</span>
                    <span class="time-zone">${item.name}</span>
                </div>
                <span class="time-date">${this.getDateByTimezone(this._timezoneOffset, item.offset).toLocaleDateString()}</span>
            </div>
        `;
    }

    changeDate( diffInMinutes = 30) {
        return () => {
            this.setTime(this.getTime() + diffInMinutes * 60000);
        }
    }

    /**
     * Returns time as HH:MM for the timezone
     * @param {TimezoneOffset} sourceTimezoneOffset
     * @param {TimezoneOffset} targetTimezoneOffset
     */
    getDateByTimezone(sourceTimezoneOffset, targetTimezoneOffset, sourceTimeStamp = this._time) {
        let date;
        if(targetTimezoneOffset === sourceTimezoneOffset){
            date = new Date(sourceTimeStamp);
        } else {
            // Moving to UTC timezone
            const utcTime = sourceTimeStamp + (sourceTimezoneOffset * 60 * 1000);

            // Moving from UTC timezone
            const targetTimezoneTime = utcTime + (-(targetTimezoneOffset) * 60 * 1000);
            date = new Date(targetTimezoneTime);
        }

        return date;
    }

    /**
     *
     * @param {Timezone} item
     * @return {string}
     */
    getFormattedTimeString(item) {
        const date = this.getDateByTimezone(this._timezoneOffset, item.offset)
        const HH = `0${(this.convertHrsTo12HrFormat(date.getHours()))}`.slice(-2);
        const MM = `0${date.getMinutes()}`.slice(-2);
        const AM_PM = date.getHours()>11?'PM':'AM';
        return `${HH}:${MM} ${AM_PM.toLowerCase()}`;
    }

    convertHrsTo12HrFormat(hours) {
        return hours > 12 ? hours % 12 : hours;
    }

    renderTimeString(time) {
        return html`${this.getFormattedTimeString(time)}`;
    }
}

customElements.define('vertzo-app', Vertzo);
