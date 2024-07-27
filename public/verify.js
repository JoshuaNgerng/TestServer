"use strict";
const noMatchDropdown = document.getElementById("no_match");
const matchFoundDropdown = document.getElementById("match_found");
function showDropdown(dropdown) {
    if (!dropdown)
        return;
    dropdown.classList.add("show");
}
function hideDropdown(dropdown) {
    if (!dropdown)
        return;
    dropdown.classList.remove("show");
}
async function verifyFromServer() {
    let id = document.getElementById("input_id").value;
    if (!id)
        return;
    const formData = new FormData();
    formData.append('filename', id);
    const response = await fetch('/download', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (!result) {
        showDropdown(noMatchDropdown);
        hideDropdown(matchFoundDropdown);
        return;
    }
    updateHTML(result);
}
function updateHTML(result) {
    const downfile = document.getElementById("downloadfile");
    document.getElementById("myHash").innerHTML = result[1];
    document.getElementById("myDate").innerHTML = result[2];
    showDropdown(matchFoundDropdown);
    hideDropdown(noMatchDropdown);
    const listItem = document.createElement('li');
    listItem.textContent = result[1];
    const downloadLink = document.createElement('a');
    downloadLink.href = `/download/${result[1]}`;
    downloadLink.textContent = 'Download';
    downloadLink.style.marginLeft = '10px';
    listItem.appendChild(downloadLink);
    downfile.appendChild(listItem);
}
