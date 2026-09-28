const listContainer = document.getElementById("list");
const message = document.getElementById("list-message");

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character]));
}

async function render() {
  try {
    const items = await MediaStore.getAll();

  if (items.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <h2>Your library is empty</h2>
        <p>Add your first book or movie to start tracking your collection.</p>
        <a href="add.html" class="btn primary">+ Add Media</a>
      </div>`;
    return;
  }

  listContainer.innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Rating</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr>
              <td class="title-cell">${escapeHtml(item.title)}</td>
              <td>${escapeHtml(item.type)}</td>
              <td><span class="status-label">${escapeHtml(item.status)}</span></td>
              <td>${item.rating || "—"}</td>
              <td class="actions-cell">
                <a href="edit.html?id=${item.id}" class="btn secondary">Edit</a>
                <button data-delete="${item.id}" class="btn danger">Delete</button>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
    message.textContent = "";
    message.className = "message";
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
  }
}

listContainer.addEventListener("click", async (e) => {
  const id = e.target.getAttribute("data-delete");
  if (!id) return;
  if (!window.confirm("Delete this media record?")) return;
  try {
    await MediaStore.remove(id);
    message.textContent = "Media deleted successfully.";
    message.className = "message success";
    render();
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
  }
});

const queryMessage = new URLSearchParams(window.location.search).get("message");
if (queryMessage) {
  message.textContent = queryMessage;
  message.className = "message success";
}
render();