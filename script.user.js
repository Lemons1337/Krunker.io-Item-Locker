// ==UserScript==
// @name         Krunker.io - Item Locker
// @namespace    http://tampermonkey.net/
// @version      0.1.3
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

addStyle(`.cardActions {
	position: absolute;
	opacity: 0;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, .85);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: rgba(255, 255, 255, .5);
	font-size: 12px;
	transition: .2s opacity
}

.cardAction {
	font-size: 19px;
	margin: 10px;
	color: rgba(255, 255, 255, .85)
}

.cardAction:hover {
	color: rgba(255, 255, 255);
	text-decoration: underline
}

.cardActionSep {
	width: 100px;
	height: 1px;
	background: #fff;
	opacity: .5
}

.marketCard:active .cardActions,
.marketCard:hover .cardActions {
	z-index: 9999999999;
	opacity: 1
}`);

var lockedItems = JSON.parse(localStorage.lockedItems || '[]');

var skins;

function getSkins(node) {
    var regex = /\w+\.exports\.skins=(\[[^\]]+\])/;
    var str = node.textContent;

    var match = str.match(regex)[1];

    skins = eval(match);
}

function addGUI(node) {
    var elem = node.querySelector('.cardActions');

    var itemId = elem.lastElementChild.onclick.toString().match(/itemsales&i=(\d+)/)[1] | 0;
    var index = lockedItems.findIndex(i => i == itemId);

    var button = document.createElement('a');

    button.setAttribute('class', 'cardAction');
    button.setAttribute('onmouseenter', "SOUND.play('tick_0',0.1)");

    if (index > -1) {
        button.innerText = 'Unlock';
    } else {
        button.innerText = 'Lock';
    }

    var div = document.createElement('div');
    div.setAttribute('class', 'cardActionSep');

    button.onclick = function(event) {
        event.stopPropagation();

        var index = lockedItems.findIndex(i => i == itemId);

        if (index > -1) {
            button.innerText = 'Lock';
            lockedItems.splice(index, 1);
        } else {
            button.innerText = 'Unlock';
            lockedItems.push(itemId);
        }

        localStorage.lockedItems = JSON.stringify(lockedItems);
    };

    elem.insertBefore(div, elem.children[2]);
    elem.insertBefore(button, elem.children[2]);
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

        if (elem.id.startsWith('trd_0_') && index > -1) {
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
        icon.setAttribute('style', 'z-index: 1; color: white; position: relative; left: 48px; top: 25px; font-size: 150px;');
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
            if (location.pathname === '/social.html' && node instanceof HTMLScriptElement && node.textContent.length > 1e4) {
                getSkins(node);
            } else if (node.className === 'marketCard' && node.querySelector('.cardCnt') && node.querySelector('.cardActions')) {
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
