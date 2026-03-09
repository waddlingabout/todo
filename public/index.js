document.addEventListener('DOMContentLoaded', () => {
    setInterval(() => {
        fetch('/api/list')
            .then(response => response.json())
            .then(data => updateUI(data))
            .catch(error => console.error(error));
    }, 1000);
});

function updateUI(data) {
    const list = document.getElementById("list");
    
    list.innerHTML = "";

    /*if(data.ok != null){
        const listItem = document.createElement("li");
        listItem.className = "unchecked";
        listItem.textContent = "Error!!";
        list.appendChild(listItem);
        return;
    }*/

    Object.values(data).forEach(value => {
        const listItem = document.createElement("li");
        if(value.checked){
            listItem.className = "checked";
        }else{
            listItem.className = "unchecked";
        }
        listItem.textContent = value.content;
        list.appendChild(listItem);
    });
}

