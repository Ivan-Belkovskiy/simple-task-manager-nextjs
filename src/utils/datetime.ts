export const getLocalDateString = (date: Date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('.')[0]
}

export const getLocalDatetimeString = (date?: Date | null) => {
    if (!date) return "";
    // const offset = date.getTimezoneOffset()
    // const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    const str = date.toLocaleString().replace(',', '');
    return str/*.slice(
        0,
        str.lastIndexOf(':')
    )*/;
}

export const subtractHours = (date: Date, hours: number) => {
    return new Date(date.getTime() - (hours * 60 * 60 * 1000));
};

export const formatHourTextForNotification = (hours: number, withNumber?: boolean) => {
    let txt = ``;

    const str = String(hours);
    if (Number(str[str.length - 1]) === 1 && (hours < 10 || hours > 20)) txt = "час";
    else if ([2, 3, 4].includes(
        Number(str[str.length - 1])
    ) && (hours < 10 || hours > 20)) txt = "часа";
    else txt = "часов";

    if (withNumber) return `${hours} ${txt}`;

    return txt;
}