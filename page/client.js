/**
 * Requests the content of the given id and places it into the element on the page with that id.
 */
function update(id, data) {
    $('#' + id).load(document.URL, {getElement: id, updateData: JSON.stringify(data)});
}

// controls
function toggleButton(element, func) {
    let l = element.classList;
    let state = l.contains('active');
    if(state)
        l.remove('active');
    else
        l.add('active');
    if(func) func(!state);
}