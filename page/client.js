console.log('console output from a clientside js file');

function testSessionData() {
    $.ajax({
        type: 'POST',
        url: document.URL,
        data: {updateData: {someKey: 'some other data'}},
        success: () => console.log('success')
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log($('h1'));
    console.log($('#randomElement'));
});