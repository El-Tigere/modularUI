var colors = [false, false, false];

function testSessionData() {
    $.ajax({
        type: 'POST',
        url: document.URL,
        data: {updateData: JSON.stringify({someKey: 'some other data'})},
        success: () => console.log('success')
    });
}