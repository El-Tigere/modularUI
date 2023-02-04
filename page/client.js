console.log('console output from a clientside js file');

document.addEventListener('DOMContentLoaded', () => {
    console.log($('h1'));
    console.log($('#randomElement'));
});