const today = () => {
    return new Date().toISOString().slice(0, 10);
}
const timePlus10 = () => {
    let d = new Date();
    let d2 = new Date(d.getTime() + 10 * 60000)
    let mins = ('0' + d2.getMinutes()).slice(-2);
    return (d2.getHours() + ":" + mins)
}
const time = () => {
    let today = new Date();
    return today.getHours() + "" + today.getMinutes();
}
module.exports = { today, timePlus10, time }