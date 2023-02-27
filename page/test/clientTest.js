var colors = [false, false, false];

function testSessionData() {
    $.ajax({
        type: 'POST',
        url: document.URL,
        data: {updateData: {someKey: 'some other data'}},
        success: () => console.log('success')
    });
}