const form = document.getElementById("add-form");
const message = document.getElementById("form-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "Saving...";
  message.className = "message";

  const item = {
    title: document.getElementById("title").value.trim(),
    type: document.getElementById("type").value,
    status: document.getElementById("status").value,
    rating: document.getElementById("rating").value,
  };

  try {
    await MediaStore.add(item);
    window.location.href = "library.html?message=Media added successfully.";
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
  }
});