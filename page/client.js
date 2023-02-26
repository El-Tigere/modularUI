
function testSessionData() {
    $.ajax({
        type: 'POST',
        url: document.URL,
        data: {updateData: {someKey: 'some other data'}},
        success: () => console.log('success')
    });
}

// TODO: don't do this in main thread
function update(id, data) {
    $('#' + id).load(document.URL, {getElement: id, elementData: data});
}

document.addEventListener('DOMContentLoaded', () => {
    console.log($('h1'));
    console.log($('#randomElement'));
});

// controls
function toggleButton(e) {
    if(e.classList.contains('active')) {
        e.classList.remove('active');
    } else {
        e.classList.add('active');
    }
}