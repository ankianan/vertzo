/**
 * @typedef {number} TimezoneOffset
 * @typedef {{name: string, offset: TimezoneOffset}} Timezone
 */

import {html, css, LitElement} from 'lit';
import {getTimezone, Timezones} from "./data/Timezones";
import './components/vertzo-timezone-selector/TimezoneSelector';
import {live} from 'lit/directives/live.js';
export class Vertzo extends LitElement {
    static get styles() {
        return css`
        :host {
            display:block;
            height: 100%;
        }
        .header {
            margin: 0;
            margin-left: 1rem;
            padding: .67em 0;
            font-size: 2.5rem;
        }
        .flex-row {
            display: flex;
            align-items: baseline;
        }
        
        .flex-col { 
            display: flex; 
            flex-direction: column;
        }
        .list {
            max-height: calc(100%-2.5rem);
            overflow-y: scroll;
            overflow-x: hidden;
            padding:0;
            margin:0;
            list-style-type: none;
            
        }
        .list-item {
            padding: 0rem 1rem 1.5rem;
            margin: 0 0 1.5rem 0;
            border-bottom: 1px solid;
            
            line-height: 1.5rem;
        }
        .list-item--title {
            white-space: nowrap;
        }
        
        .time-hm {
            font-size: 1.75rem;
            margin-right: 7px
        }
        .time-zone {
            font-size: 1.25rem;
        }
        .time-date {
            font-size: 1rem
        }
        `;
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
            <h1 class="header">
                Vertzo
            </h1>
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

    /**
     *
     * @param {Timezone} timezone
     * @return {function(*): void}
     */
    setHoursAndMinutes(timezone){
        return (event)=>{
            const hours = parseInt(event.target.valueAsNumber);
            const minutes = event.target.valueAsNumber  - hours;

            //Convert local timezone selected date to target timezone
            const dateInTargetTimezone = this.getDateByTimezone(this._timezoneOffset, timezone.offset);

            //Modify date
            dateInTargetTimezone.setHours(hours);
            dateInTargetTimezone.setMinutes(minutes*60);

            //Convert date in target timezone to local timezone
            const dateInLocalTimezone = this.getDateByTimezone(timezone.offset, this._timezoneOffset, dateInTargetTimezone.getTime())

            this.setTime(dateInLocalTimezone.getTime())
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

    /**
     * @link https://lit-html.polymer-project.org/guide/template-reference
     * @param {Timezone} timezone
     * @return {*}
     */
    renderHourSelector(timezone) {
        return html`
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <button  @click="${this.changeDate(-30)}">DOWN</button>
                <button @click="${this.changeDate(30)}">UP</button>
            </div>
            <input style="width: 100%;" type="range" list="tickmarks" .value="${this.getDateAsSliderValue(timezone)}" @input="${this.setHoursAndMinutes(timezone)}" min="0" max="23.5" step=".5">
        `
    }

    changeDate(addMinutes){
        return ()=>{
            const date = new Date(this._time);
            date.setMinutes(date.getMinutes() + addMinutes);
            this.setTime(date.getTime());
        }
    }

    /**
     *
     * @param timezone
     * @return {number}
     */
    getDateAsSliderValue(timezone) {
        const date = this.getDateByTimezone(this._timezoneOffset, timezone.offset);
        const minutes = date.getMinutes() > 30 ? 0.5:0;
        let hours = date.getHours();
        return hours + minutes;
    }

    /**
     *
     * @param {Timezones} item
     * @return {*}
     */
    renderTimeString(time) {
        return html`${this.getFormattedTimeString(time)}`;
    }
}

customElements.define('vertzo-app', Vertzo);
