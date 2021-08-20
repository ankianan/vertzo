/**
 * @typedef {{name: string, offset: number}} Timezone
 * @type {{"-330": Timezone}}
 */
export const Timezones = {
    '-330': {
        "name": "IST",
        offset: -330
    },
    '420': {
        "name": "PDT",
        offset: 420
    }
}

/**
 *
 * @param timezoneOffset
 * @return {Timezone}
 */
export function getTimezone(timezoneOffset) {
    return Timezones[timezoneOffset];
}