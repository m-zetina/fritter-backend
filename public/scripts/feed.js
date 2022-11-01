function refreshFeed(fields) {
  fetch('/api/feeds')
    .then(showResponse)
    .catch(showResponse);
}

function changeActiveFilter(fields) {
  fetch(`/api/feeds/${fields.activeFilter}`, {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}
