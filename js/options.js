// Saves options to chrome.storage
function play_sound() {
    var soundFile = $('#cb_sound').val();// document.getElementById('sound').value;
    if (soundFile != '') {
        var sound = new Audio(chrome.extension.getURL('assets/' + soundFile));
        sound.play();
    }
}

function save_options() {
    var sound = document.getElementById('cb_sound').value;
    chrome.storage.sync.set({
        sound: sound
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
    var bg = chrome.extension.getBackgroundPage();
    if (bg && bg.setOptions) {
        bg.setOptions({sound: sound});
    }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        sound: 'offersound.ogg'
    }, function (items) {
        document.getElementById('cb_sound').value = items.sound;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('play').addEventListener('click', play_sound);

$('#cb_sound').change(function () {
    alert('abc');
    play_sound();
    save_options();
});
