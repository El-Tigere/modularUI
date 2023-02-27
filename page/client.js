// TODO: don't do this in main thread
function update(id, data) {
    $('#' + id).load(document.URL, {getElement: id, elementData: data});
}

// controls
function toggleButton(element, func) {
    let l = element.classList;
    if(l.contains('active'))
        l.remove('active');
    else
        l.add('active');
    if(func) func();
}