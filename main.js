const range = document.querySelector('input[type=range]');
const span = document.querySelector('span');
const outputBox = document.querySelector('section#output');
// Using var because of Safari https://stackoverflow.com/questions/40091136
var output = outputBox.querySelector('section');
const ol = document.querySelector('section#output section ol');
var hideButton = document.querySelector('#hideButton');

/**
 * Miscellaneous functions
 */

let beginWorld = Date.now();

function clearLog() {
  ol.innerHTML = '';
  beginWorld = Date.now();
}

function rangeHandler() {
  span.innerText = this.value + 'ms';
}

function toggleOutputDisplay() {
  outputBox.classList.toggle('hidden');
  outputBox.classList.contains('hidden') ? hideButton.innerHTML = "&#8678;" : hideButton.innerHTML= "&#8680;";
}

/**
 * Setup input[type=range] with range value handler
 */
range.addEventListener('mousemove', rangeHandler);
range.addEventListener('touchend', rangeHandler);

/**
 * Setup event checkboxes to add scroll & touch listeners.
 */
const eventCheckboxes = document.querySelectorAll('input[type=checkbox][data-event-box]');
const eventCheckboxMap = {};

function updateListener(e) {
  const eventName = e.target.dataset.eventName;
  if (e.target.checked) {
    /**
     * Explicitly adding {passive: false} to AddEventListenerOptions
     * (https://dom.spec.whatwg.org/#dom-addeventlisteneroptions-passive)
     * because in Chrome, by default, touch scroll-blocking event listeners
     * are passive by default though this behavior is not spec'd yet.
     * See https://github.com/WICG/interventions/issues/35
     */
    window.addEventListener(eventName, eventHandler, {passive: false});
  } else {
    passiveCheckboxMap[eventName].checked = false;
    window.removeEventListener(eventName, eventHandler, {passive: false});
  }
}

eventCheckboxes.forEach(checkBox => {
  eventCheckboxMap[checkBox.dataset.eventName] = checkBox;
  checkBox.addEventListener('change', updateListener);
});

/**
 * Setup 'make passive' checkboxes to turn their corresponding event listeners
 * into passive event listeners. If there exists no corresponding non-passive listener
 * for the event in question, a passive one will NOT be added.
 */
const passiveCheckboxes = document.querySelectorAll('input[type=checkbox][data-passive-box]');
const passiveCheckboxMap = {};

function passiveListener(e) {
  const eventName = e.target.dataset.eventName;
  if (!eventCheckboxMap[eventName].checked) {
    this.checked = false;
    return;
  }

  if (e.target.checked) {
    window.removeEventListener(eventName, eventHandler, {passive: false});
    window.addEventListener(eventName, eventHandler, {passive: true});
  } else {
    window.removeEventListener(eventName, eventHandler, {pasive: true});
    window.addEventListener(eventName, eventHandler, {passive: false});
  }
}

passiveCheckboxes.forEach(checkBox => {
  passiveCheckboxMap[checkBox.dataset.eventName] = checkBox;
  checkBox.addEventListener('change', passiveListener);
});

// Event handler to perform heavy-duty "work"
function eventHandler(e) {
  let begin = Date.now();
  while (Date.now() <= begin + parseInt(range.value)) {}
  let newListItem = document.createElement('li');
  newListItem.innerText = `Work done (time: ${Math.floor(Date.now() - beginWorld)})`;
  ol.appendChild(newListItem);
  output.scrollTop = output.scrollHeight;
}
