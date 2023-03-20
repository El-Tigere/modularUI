function update(id, data) {
    $('#' + id).load(document.URL, {getElement: id, updateData: data});
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