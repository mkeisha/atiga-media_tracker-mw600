const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-form");
const message = document.getElementById("form-message");

async function loadItem() {
  try {
    const item = await MediaStore.getById(id);
    document.getElementById("title").value = item.title;
    document.getElementById("type").value = item.type;
    document.getElementById("status").value = item.status;
    document.getElementById("rating").value = item.rating || "";
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
    form.querySelector("button[type=submit]").disabled = true;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "Saving...";
  message.className = "message";

  const changes = {
    title: document.getElementById("title").value.trim(),
    type: document.getElementById("type").value,
    status: document.getElementById("status").value,
    rating: document.getElementById("rating").value,
  };

  try {
    await MediaStore.update(id, changes);
    window.location.href = "library.html?message=Media updated successfully.";
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
  }
});

loadItem();