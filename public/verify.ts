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
	const result = await response.json();
	console.log('luls');
	if (!result) {
		showDropdown(noMatchDropdown);
		hideDropdown(matchFoundDropdown);
		return ;
	}
	updateHTML(result);
}

function updateHTML(result: any) {
	console.log('bruuhhh');
	const downfile = (document.getElementById("downloadfile") as HTMLInputElement);
	(document.getElementById("myHash") as HTMLInputElement).innerHTML = result[1];
	(document.getElementById("myDate") as HTMLInputElement).innerHTML = result[2];
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
