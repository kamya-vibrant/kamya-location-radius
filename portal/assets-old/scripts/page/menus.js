function deleteItem(element,parentNode) {
    console.log(element);
    var listItem = element.parentNode;
    var confirmDelete = confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
        listItem.closest(parentNode).remove();
    }
};
