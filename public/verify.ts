import * as log from "./log.js";

async function verifyFromServer() {
	let id = (document.getElementById("input_id") as HTMLInputElement).value;
	if (!id)
		return ;
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

	function showDropdown(dropdown: HTMLElement | null) {
		if (!dropdown)
			return ;
		dropdown.classList.add("show");
	}

	function hideDropdown(dropdown: HTMLElement | null) {
		if (!dropdown)
			return ;
		dropdown.classList.remove("show");
	}

	function dropdownHandler(str: string) {
		console.log(str);
		if (typeof log[str] != "undefined") {
			(document.getElementById("myHash") as HTMLInputElement).innerHTML = log[str];
			(document.getElementById("myDate") as HTMLInputElement).innerHTML = log[`${str}date`];
			showDropdown(matchFoundDropdown);
			hideDropdown(noMatchDropdown);
		} else {
			showDropdown(noMatchDropdown);
			hideDropdown(matchFoundDropdown);
		}
	}

	formElement!.addEventListener("submit", (event: SubmitEvent) => {
		event.preventDefault();

		let formEl = event.currentTarget;
		let inputValue = (formEl as HTMLFormElement).elements["hash-input"].value.trim();

		// console.log(inputValue);

		dropdownHandler(inputValue);
	});
});
