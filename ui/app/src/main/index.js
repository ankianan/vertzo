import {html, css, LitElement} from 'lit';
import {getTimezone, Timezones} from "./data/Timezones";
import './components/vertzo-timezone-selector/TimezoneSelector';
export class Vertzo extends LitElement {
    static get styles() {
        return css`
        .row {
            display: flex;
            margin: 5px 0;
            border: solid 1px;
        }
        .item { 
            width: 100%;
            padding: 10px 5px;
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

        /**
         *
         * @type {{timezone: Timezone}[]}
         * @private
         */
        this._list = Object.keys(Timezones).map(offset=>({
            timezone: Timezones[offset]
        }));

        this._time = new Date().getTime();
        setInterval(()=>{
            this._time = new Date().getTime();
        },1000)
        this._timezoneOffset = new Date().getTimezoneOffset();
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
            <div>
                ${this._list.map(item=>
                    html`
                        <div class="row">
                            <vertzo-timezone-selector class="item" value="${item.timezone.offset}"></vertzo-timezone-selector>
                            <span class="item">${this.getDateByTimezone(item.timezone).toLocaleTimeString()}</span>
                            <span class="item">${this.getDateByTimezone(item.timezone).toLocaleDateString()}</span>
                        </div>
                    `
                )}
            </div>
        `;
    }
}

customElements.define('vertzo-app', Vertzo);
