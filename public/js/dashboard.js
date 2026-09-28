const totalMedia = document.getElementById("total-media");
const wantToWatch = document.getElementById("want-to-watch");
const completed = document.getElementById("completed");
const message = document.getElementById("dashboard-message");

MediaStore.getStats()
	.then((stats) => {
		totalMedia.textContent = stats.totalMedia;
		wantToWatch.textContent = stats.wantToWatch;
		completed.textContent = stats.completed;
	})
	.catch((error) => {
		message.textContent = error.message;
		message.className = "message error";
	});
