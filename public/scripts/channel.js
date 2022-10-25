/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function viewAllChannels(fields) {
  fetch('/api/channels')
    .then(showResponse)
    .catch(showResponse);
}

function viewChannelsByOwner(fields) {
  fetch(`/api/channels?owner=${fields.owner}`)
    .then(showResponse)
    .catch(showResponse);
}

function createChannel(fields) {
  fetch('/api/channels', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function editChannel(fields) {
  fetch(`/api/channels/${fields.id}`, {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteChannel(fields) {
  fetch(`/api/channels/${fields.id}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}

function joinChannel(fields) {
  fetch('/api/channels/join', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function leaveChannel(fields) {
  fetch('/api/channels/leave', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}
