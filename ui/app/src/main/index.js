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
        .row {
            display: flex;
            border-bottom: dashed 1px;
            justify-content: space-between; align-items: center
        }
        .row:first-child{
            border-top: dashed 1px;
        }
        .col { 
            padding: 10px 0;
            margin: 0px 5px;
            box-sizing: border-box;
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
        return `${HH}:${MM} ${AM_PM}`;
    }

    convertHrsTo12HrFormat(hours) {
        return hours > 12 ? hours % 12 : hours;
    }

    render() {
        let currentTimezone = Timezones[this._timezoneOffset];
        return html`
            <div style="display: flex; flex-direction: column; justify-content: flex-end; height: 100%">
                ${this._list.map(timezone=>this.renderRow(timezone, this.renderHourSelector(timezone), this.renderTimeString(timezone)))}
                ${this.renderRow(currentTimezone, this.renderHourSelector(currentTimezone), this.renderTimeString(currentTimezone))}
            </div>
        `;
    }

    /**
     *
     * @param item
     * @param hourSelectorSlot
     * @param timeSlot
     * @return {*}
     */
    renderRow(item, hourSelectorSlot = null, timeSlot) {
        return html`
                        <div class="row">
                            <vertzo-timezone-selector class="col" value="${item.offset}"></vertzo-timezone-selector>
                            <div class="col">
                                ${hourSelectorSlot}
                            </div>
                            <div class="col" style="display: flex; flex-direction: column; justify-content: space-between; text-align: end">
                                ${timeSlot}
                                <span>${this.getDateByTimezone(this._timezoneOffset, item.offset).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
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
        return html`<span style="font-size: 1.5rem; white-space: nowrap">${(this.getFormattedTimeString(time))}</span>`;
    }
}

customElements.define('vertzo-app', Vertzo);
