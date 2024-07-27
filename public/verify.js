import * as log from "./log.js";
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
    const result = await response.text();
    // alert(result);
}
window.addEventListener("DOMContentLoaded", () => {
    //   let testString = "12345";
    //   let displayString = "Justin";
    let formElement = document.getElementById("my-form");
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
    function dropdownHandler(str) {
        console.log(str);
        if (typeof log[str] != "undefined") {
            document.getElementById("myHash").innerHTML = log[str];
            document.getElementById("myDate").innerHTML = log[`${str}date`];
            showDropdown(matchFoundDropdown);
            hideDropdown(noMatchDropdown);
        }
        else {
            showDropdown(noMatchDropdown);
            hideDropdown(matchFoundDropdown);
        }
    }
    formElement.addEventListener("submit", (event) => {
        event.preventDefault();
        let formEl = event.currentTarget;
        let inputValue = formEl.elements["hash-input"].value.trim();
        // console.log(inputValue);
        dropdownHandler(inputValue);
    });
});
