// ==UserScript==
// @name         Krunker.io - Item Locker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Lock items in your inventory
// @author       Lemons
// @match        *://krunker.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

function addStyle(str, url) {
    if (url) {
        const link = document.createElement('link');
        link.setAttribute('href', str);
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        document.head.append(link);
    } else {
        const style = document.createElement('style');
        style.textContent = str;
        document.head.append(style);
    }
}

addStyle('https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css', true);

addStyle(`.lockItemBtn {
    font-size: 12px;
    color: #fff;
    background-color: #e8da00;
    padding: 5px;
    padding-bottom: 2px;
    padding-top: 2px;
    cursor: pointer;
    pointer-events: auto;
    z-index: 9999999;
    position: absolute;
    text-align: center;
    border-radius: 4px;
    text-shadow: none;
    top: 204px;
    right: 32px;
}

#itemLocked {
    border: 2px solid red;
    padding: 3px;
    padding-bottom: 0px;
    padding-top: 0px;
}

.lockItemBtn:hover {
    background-color: yellow;
}`);

var lockedItems = JSON.parse(localStorage.lockedItems || '[]');

var skins;

function getSkins(node) {
    var regex = /\w+\.exports\.skins=(\[[^\]]+\])/;
    var str = node.innerText;

    var match = str.match(regex)[1];

    skins = eval(match);
}

function addGUI(node) {
    var div = document.createElement('div');

    var itemId = node.lastElementChild.onclick.toString().match(/itemsales&i=(\d+)/)[1] | 0;
    var index = lockedItems.findIndex(i => i == itemId);

    div.setAttribute('class', 'lockItemBtn');
    div.setAttribute('onmouseenter', "SOUND.play('tick_0',0.1)");

    if (index > -1) {
        div.setAttribute('id', 'itemLocked');
        div.innerHTML = '<i style="color: white; position: relative; bottom: 4px;" class="fa fa-lock fa-lg"></i>';
    } else {
        div.innerHTML = '<i style="color: white; position: relative; bottom: 4px;" class="fa fa-unlock-alt fa-lg"></i>';
    }

    div.onclick = function(event) {
        event.stopPropagation();

        var index = lockedItems.findIndex(i => i == itemId);

        if (index > -1) {
            div.innerHTML = '<i style="color: white; position: relative; bottom: 4px;" class="fa fa-unlock-alt fa-lg"></i>';
            div.removeAttribute('id');
            lockedItems.splice(index, 1);
        } else {
            div.innerHTML = '<i style="color: white; position: relative; bottom: 4px;" class="fa fa-lock fa-lg"></i>';
            div.setAttribute('id', 'itemLocked');
            lockedItems.push(itemId);
        }

        localStorage.lockedItems = JSON.stringify(lockedItems);
    };

    node.insertBefore(div, node.lastElementChild);
}

function declineLocked(node) {
    var elems = node.getElementsByClassName('offerHolder');

    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        var btn;

        if (btn = elem.querySelector('.offerCancel')) {
            var mySkins = elem.onclick.toString().match(/\d+,\d+,"[^"]+","([^"]+)"/)[1].split(',');
            var foundLocked = false;

            for (var h = 0; h < mySkins.length; h++) {
                for (var j = 0; j < lockedItems.length; j++) {
                    if (mySkins[h] == lockedItems[j]) foundLocked = true;
                }
            }

            if (foundLocked) {
                btn.click();
            }
        }
    }
}

function disableTradeIG(node) {
    for (var i = 0; i < lockedItems.length; i++) {
        var itemId = lockedItems[i];
        var elem = document.getElementById('trd_inv_' + itemId);

        if (elem) {
            var icon = document.createElement('i');
            icon.setAttribute('style', 'z-index: 1; color: white; position: relative;');
            icon.setAttribute('class', 'fa fa-lock fa-3x');

            elem.firstChild.setAttribute('style', 'position: absolute; left: 5px;');
            elem.insertBefore(icon, elem.firstChild);

            elem.style['pointer-events'] = 'none';
            elem.style.filter = 'grayscale(100%)';
            elem.style.cursor = 'default';

            elem.onclick = function(event) {
                event.stopPropagation();
            };
        }
    }
}

function disableTrade(node) {
    var elems = document.querySelectorAll('.tItemHolder');

    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];

        var skinName = elem.querySelector('.tItemN').innerText;

        var index = skins.findIndex(s => s.name === skinName);

        if (index > -1) {
            var lockIndex = lockedItems.indexOf(index);

            if (lockIndex > -1) {
                var icon = document.createElement('i');
                icon.setAttribute('style', 'z-index: 1; color: white; position: relative; left: 14px; top: 5px;');
                icon.setAttribute('class', 'fa fa-lock fa-3x');

                elem.firstChild.setAttribute('style', 'position: absolute; left: 5px;');
                elem.insertBefore(icon, elem.firstChild);

                elem.style['pointer-events'] = 'none';
                elem.style.filter = 'grayscale(100%)';
                elem.style.cursor = 'default';

                elem.onclick = function(event) {
                    event.stopPropagation();
                };
            }
        }
    }
}

function disableListItems(node) {
    var elem = node.parentElement;

    var itemId = elem.querySelector('.popupImgInfo').onclick.toString().match(/\((\d+)\)/)[1] | 0;
    var lockIndex = lockedItems.indexOf(itemId);

    if (lockIndex > -1) {
        var btn = node.querySelector('#postSaleBtn');
        btn.setAttribute('style', 'background-color:#2b2b2b');
        btn.removeAttribute('onmouseover');
        btn.innerText = 'Item Locked';

        btn.onclick = function(event) {
            event.stopPropagation();
        };

        var icon = document.createElement('i');
        icon.setAttribute('style', 'z-index: 1; color: white; position: relative; left: 45px; top: 25px; font-size: 150px;');
        icon.setAttribute('class', 'fa fa-lock fa-5x');

        var _elem = elem.querySelector('.popupImgH');

        _elem.firstChild.setAttribute('style', 'position: absolute; left: 10px;');
        _elem.insertBefore(icon, _elem.firstChild);

        _elem.style['pointer-events'] = 'none';
        _elem.style.filter = 'grayscale(100%)';
        _elem.style.cursor = 'default';
    }
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (location.pathname === '/social.html' && node instanceof HTMLScriptElement && node.innerText.length > 1e5) {
                getSkins(node);
            } else if (node.className === 'marketCard' && node.querySelector('.cardEst')) {
                addGUI(node);
            } else if (node.querySelector && node.querySelector('.offerHolder')) {
                declineLocked(node);
            } else if (node.className === 'tHolderM') {
                disableTradeIG(node);
            } else if (node.className === 'tHolderL') {
                disableTrade(node);
            } else if (node.querySelector && node.querySelector('#postSaleBtn')) {
                disableListItems(node);
            }
        });
    });
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});
