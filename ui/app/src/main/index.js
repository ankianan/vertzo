import {html, css, LitElement} from 'lit';
import {getTimezone, Timezones} from "./data/Timezones";
import './components/vertzo-timezone-selector/TimezoneSelector';
export class Vertzo extends LitElement {
    static get styles() {
        return css`
        :host {
            display:block;
            height: 100%;
        }
        .row {
            display: flex;
            margin: 5px 0;
            border: solid 1px;
        }
        .col { 
            width: 100%;
            padding: 10px 0;
            margin: 0px 10px;
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
         * @type {{timezone: Timezone}[]}
         * @private
         */
        this._list = Object.keys(Timezones)
            .filter(offset=>parseInt(offset) !== this._timezoneOffset)
            .map(offset=>Timezones[offset]);

        var now = new Date();
        //now.setMinutes(0);
        now.setSeconds(0);
        this.setTime(now.getTime());
    }

    setTime(time) {
        this._time = time;
    }

    setHoursAndMinutes(){
        return (event)=>{
            const date = new Date(this._time);
            const hours = parseInt(event.target.valueAsNumber);
            const minutes = event.target.valueAsNumber  - hours
            date.setHours(hours);
            date.setMinutes(minutes*60);
            this.setTime(date.getTime())
        }
    }

    /**
     * Returns time as HH:MM for the timezone
     * @param {Timezone} timezone
     */
    getDateByTimezone(timezone) {
        let date;
        if(timezone.offset === this._timezoneOffset){
            date = new Date(this._time);
        } else {
            // Moving to UTC timezone
            const utcTime = this._time + (this._timezoneOffset * 60 * 1000);

            // Moving from UTC timezone
            const timezoneTime = utcTime + (-(timezone.offset) * 60 * 1000);
            date = new Date(timezoneTime);
        }

        return date;
    }

    render() {
        return html`
            <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%">
                <div>
                    ${this._list.map(item=>this.renderRow(item))}
                </div>
                ${this.renderRow(Timezones[this._timezoneOffset], this.renderHourSelector())}
            </div>
        `;
    }

    renderRow(item, hourSelector = null) {
        return html`
                        <div class="row" style="display: flex; justify-content: space-between; align-items: center">
                            <vertzo-timezone-selector class="col" value="${item.offset}"></vertzo-timezone-selector>
                            <div class="col">
                                ${hourSelector}
                            </div>
                            <div class="col" style="display: flex; flex-direction: column; justify-content: space-between; text-align: end">
                                <span style="font-size: 1.5rem">${(this.getFormattedTimeString(item))}</span>
                                <span>${this.getDateByTimezone(item).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
    }

    getFormattedTimeString(item) {
        const date = this.getDateByTimezone(item)
        const HH = `0${date.getHours()}`.slice(-2);
        const MM = `0${date.getMinutes()}`.slice(-2);
        return `${HH}:${MM}`
    }

    renderHourSelector() {
        return html`
            <input type="range" list="tickmarks" @input="${this.setHoursAndMinutes()}" min="0" max="23" step=".5">
                
            <datalist id="tickmarks">
              ${Array.from({length:48}, (val, index)=>(index/2)).map(val=>html`<option value="${val}"></option>`)}
            </datalist>
        `
    }
}

customElements.define('vertzo-app', Vertzo);
