import timezones from 'timezones-list';

/**
 @typedef {{label: String, name: String, tzCode: String, utc: String}} timezone
 */

/**
 * @typedef {number} TimezoneOffset
 */

/**
 * @typedef {{offset:TimezoneOffset, name: String, utc: String}} Timezone
 */

/**
 *
 * @type {Timezone[]}
 */
export const Timezones = [];

export const TimezoneMap = {};

timezones.forEach(
/**
 * Reduces timezone to Timezone
 * @param acc
 * @param {timezone} timezone
 * @return {{}}
 */
function (timezone){
    const Timezone = createTimezone(timezone);
    if(!(Timezone.offset in TimezoneMap)){
        TimezoneMap[Timezone.offset] = Timezone;
        Timezones.push(Timezone);
    }


});


/**
 *
 * @param {timezone} timezone
 * @return {Timezone}
 */
export function createTimezone(timezone) {
    return Object.create(timezone, {
        'offset': {
            value: getTimezoneOffset(timezone),
        }
    });
}

/**
 * @param {timezone} timezone
 * @return {TimezoneOffset}
 */
export function getTimezoneOffset(timezone) {
    const utc = timezone.utc;
    const [hh, mm] = utc.split(":");

    return -(parseInt(hh)*60 + parseInt(mm));
}