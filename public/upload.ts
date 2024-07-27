let dropArea = document.getElementById("drop-area");
let fileInput = document.getElementById("input-file");
let filePreview = document.getElementById("file-preview");
let dropFilesHeading = document.getElementById(
		"no-drop-files-heading"
	);
let insertDriveFileImg = (document.querySelector(
		"#drop-area img"
	) as HTMLInputElement);
let submitButton = document.querySelector(".buttons3");
let fileCountElement = document.getElementById("file-count");


// Define file type icons
const fileIcons: { [id: string] : string; }  = {
	"image/png": "Style/img/png-icon.png",
	"image/jpeg": "Style/img/jpeg-icon.png",
	"application/pdf": "Style/img/pdf-icon.png",
	"text/plain": "Style/img/txt-icon.png",
	"application/zip": "Style/img/zip-icon.png",
	default: "Style/img/default-icon.png",
	trash: "Style/img/trash-icon.png",
};

document.addEventListener("DOMContentLoaded", () => {
	const dropArea = document.getElementById("drop-area");
	const fileInput = document.getElementById("input-file");
	const filePreview = document.getElementById("file-preview");
	const dropFilesHeading = document.getElementById(
		"no-drop-files-heading"
	);
	const insertDriveFileImg = (document.querySelector(
		"#drop-area img"
	) as HTMLInputElement);
	const submitButton = document.querySelector(".buttons3");
	const fileCountElement = document.getElementById("file-count");
	// Handle drag events
	dropArea!.addEventListener("dragover", (event) => {
		  event.preventDefault();
		  event.stopPropagation();
		  dropArea!.classList.add("dragging");
		});

		dropArea!.addEventListener("dragleave", (event) => {
		  event.preventDefault();
		  event.stopPropagation();
		  dropArea!.classList.remove("dragging");
		});

		dropArea!.addEventListener("drop", (event) => {
		  event.preventDefault();
		  event.stopPropagation();
		  dropArea!.classList.remove("dragging");

		  const files = event.dataTransfer!.files;
		  handleFiles(files);
		});

		// Handle file input change
		fileInput!.addEventListener("change", (event) => {
		  const files = (event.target as HTMLInputElement).files;
		  if (!files)
				return ;
		  handleFiles(files);
		});

		function handleFiles(files: FileList) {
		  filePreview!.innerHTML = "";
		  insertDriveFileImg.style.display = "none";

		  if (files.length === 0) {
			showInitialView();
		  } else {
			dropArea!.classList.remove("drop-area-dashed");
			dropArea!.classList.add("drop-area-no-border");
			dropFilesHeading!.style.display = "none";
			submitButton!.classList.add("show-submit-button");
			fileInput!.style.display = "none";
		  }

		  updateFileCount(files.length);

		  for (const file of files) {
			const fileContainer = document.createElement("div");
			fileContainer.className = "file-item";
			fileContainer.dataset.name = file.name;

			const fileIcon = document.createElement("img");
			fileIcon.className = "file-icon";
			fileIcon.src = fileIcons[file.type] || fileIcons["default"];

			const fileName = document.createElement("p");
			fileName.textContent = file.name;

			const removeButton = document.createElement("img");
			removeButton.className = "remove-icon";
			removeButton.src = fileIcons["trash"];
			removeButton.alt = "Remove";
			removeButton.addEventListener("click", (event) => {
			  event.stopPropagation();
			  fileContainer.remove();
			  updateFileInput();
			  if (filePreview!.children.length === 0) {
				showInitialView();
			  }
			  updateFileCount(filePreview!.children.length);
			});

			fileContainer.appendChild(fileIcon);
			fileContainer.appendChild(fileName);
			fileContainer.appendChild(removeButton);

			filePreview!.appendChild(fileContainer);
		  }
		}

		function updateFileCount(count: number) {
		  if (count > 0) {
			fileCountElement!.textContent = `Files Uploaded: ${count}`;
			fileCountElement!.style.display = "block";
		  } else {
			fileCountElement!.style.display = "none";
		  }
		}

		function updateFileInput() {
		  const dataTransfer = new DataTransfer();
		  const fileInput = (document.getElementById("input-file") as HTMLInputElement);

		  Array.from(filePreview!.getElementsByClassName("file-item")).forEach(
			(fileItem) => {
			  const fileName = fileItem.querySelector("p")!.textContent;
			  if (!fileInput.files)
					return ;
			  const file = Array.from(fileInput.files).find(
				(f) => f.name === fileName
			  );
			  if (file) {
				dataTransfer.items.add(file);
			  }
			}
		  );

		  fileInput.files = dataTransfer.files;

		  if (dataTransfer.files.length === 0) {
			fileInput.style.display = "block";
		  }
		}

		function showInitialView() {
		  insertDriveFileImg.style.display = "block";
		  dropArea!.classList.add("drop-area-dashed");
		  dropArea!.classList.remove("drop-area-no-border");
		  dropFilesHeading!.style.display = "block";
		  submitButton!.classList.remove("show-submit-button");
		  fileInput!.style.display = "block";
		  updateFileCount(0);
		}
});

function updateFileInput() {
	const dataTransfer = new DataTransfer();
	const fileInput = (document.getElementById("input-file") as HTMLInputElement);

	Array.from(filePreview!.getElementsByClassName("file-item")).forEach(
		(fileItem) => {
			const fileName = fileItem.querySelector("p")!.textContent;
			if (!fileInput.files)
				return ;
			const file = Array.from(fileInput.files).find(
				(f) => f.name === fileName
			);
			if (file) {
				dataTransfer.items.add(file);
			}
		});

	fileInput.files = dataTransfer.files;

	if (dataTransfer.files.length === 0) {
		fileInput.style.display = "block";
	}
}
 
  function handleFiles(files: FileList) {
	filePreview!.innerHTML = "";
	insertDriveFileImg.style.display = "none";

	if (files.length === 0) {
		showInitialView();
	} else {
		dropArea!.classList.remove("drop-area-dashed");
		dropArea!.classList.add("drop-area-no-border");
		dropFilesHeading!.style.display = "none";
		submitButton!.classList.add("show-submit-button");
		fileInput!.style.display = "none";
	}

	updateFileCount(files.length);

	for (const file of files) {
		const fileContainer = document.createElement("div");
		fileContainer.className = "file-item";
		fileContainer.dataset.name = file.name;
		const fileIcon = document.createElement("img");
		fileIcon.className = "file-icon";
		fileIcon.src = fileIcons[file.type] || fileIcons["default"];

		const fileName = document.createElement("p");
		fileName.textContent = file.name;

		const removeButton = document.createElement("img");
		removeButton.className = "remove-icon";
		removeButton.src = fileIcons["trash"];
		removeButton.alt = "Remove";
		removeButton.addEventListener("click", (event) => {
		event.stopPropagation();
		fileContainer.remove();
		updateFileInput();
		if (filePreview!.children.length === 0) {
			showInitialView();
		}
		updateFileCount(filePreview!.children.length);
	});

	fileContainer.appendChild(fileIcon);
	fileContainer.appendChild(fileName);
	fileContainer.appendChild(removeButton);

	filePreview!.appendChild(fileContainer);
	}
}

function updateFileCount(count: number) {
	if (count > 0) {
		fileCountElement!.textContent = `Files Uploaded: ${count}`;
		fileCountElement!.style.display = "block"; // Show file count
	} else {
		fileCountElement!.style.display = "none"; // Hide file count
	}
}

async function sentFilestoServer() {
	const filesInput = (document.getElementById("input-file") as HTMLInputElement);
	if (!filesInput || !filesInput.files) {
		return ;
	}
	const formData = new FormData();
	for (const file of filesInput.files) {
		console.log(file.name);
		formData.append('file', file);
	}
	const response = await fetch('/upload', {
		method: 'POST',
		body: formData
	});
	const result = await response.text();
	alert(result);
}

function showInitialView() {
	insertDriveFileImg.style.display = "block";
	dropArea!.classList.add("drop-area-dashed");
	dropArea!.classList.remove("drop-area-no-border");
	dropFilesHeading!.style.display = "block";
	submitButton!.classList.remove("show-submit-button");
	fileInput!.style.display = "block";
	updateFileCount(0); // Ensure file count is hidden initially
}
