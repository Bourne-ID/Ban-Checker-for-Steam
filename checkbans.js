//http://stackoverflow.com/questions/2399389/detect-chrome-extension-first-run-update

// chrome.runtime.onInstalled.addListener(function(details){
//     if(details.reason == "install"){
//         chrome.runtime.openOptionsPage();
//     }else if(details.reason == "update"){
//         var thisVersion = chrome.runtime.getManifest().version;
//         console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
//     }
// });


javascript:(function(){
    // Javascript does not work well with integers greater than 53 bits precision... So we need
    // to do our maths using strings.
    function getDigit(x, digitIndex) {
        return (digitIndex >= x.length) ? "0" : x.charAt(x.length - digitIndex - 1);
    }
    function prefixZeros(strint, zeroCount) {
        var result = strint;
        for (var i = 0; i < zeroCount; i++) {
            result = "0" + result;
        }
        return result;
    }
    //Only works for positive numbers, which is fine in our use case.
    function add(x, y) {
        var maxLength = Math.max(x.length, y.length);
        var result = "";
        var borrow = 0;
        var leadingZeros = 0;
        for (var i = 0; i < maxLength; i++) {
            var lhs = Number(getDigit(x, i));
            var rhs = Number(getDigit(y, i));
            var digit = lhs + rhs + borrow;
            borrow = 0;
            while (digit >= 10) {
                digit -= 10;
                borrow++;
            }
            if (digit === 0) {
                leadingZeros++;
            } else {
                result = String(digit) + prefixZeros(result, leadingZeros);
                leadingZeros = 0;
            }
        }
        if (borrow > 0) {
            result = String(borrow) + result;
        }
        return result;
    }

    function getId(friend) {
        var steam64identifier = "76561197960265728";
        var miniProfileId = friend.attributes.getNamedItem('data-miniprofile').value;
        return add(steam64identifier, miniProfileId);
    }

    var friends = [].slice.call(document.querySelectorAll('#memberList .member_block, .friendHolder, .friendBlock'));
    var lookup = {};

    friends.forEach(function(friend) {
        var id = getId(friend);
        if (!lookup[id]) {
            lookup[id] = [];
        }
        lookup[id].push(friend);
    });

    function setVacation(player) {
        var friendElements = lookup[player.SteamID];

        friendElements.forEach(function(friend) {
            var inGameText = friend.querySelector('.linkFriend_in-game');
            var span = document.createElement('span');
            span.style.fontWeight = 'bold';
            span.style.display = 'block';

            if (inGameText) {
                inGameText.innerHTML = inGameText.innerHTML.replace(/<br ?\/?>/, ' - ');
            }

            if (player.NumberOfVACBans || player.NumberOfGameBans) {
                var text = '';

                if (player.NumberOfGameBans) {
                    text += player.NumberOfGameBans + ' OW bans';
                }

                if (player.NumberOfVACBans) {
                    text += (text === '' ? '' : ', ') +
                        player.NumberOfVACBans + ' VAC bans';
                }
                text += ' ' + player.DaysSinceLastBan + ' days ago.';

                span.style.color = 'rgb(255, 73, 73)';
                span.innerHTML = text;
            } else {
                span.style.color = 'rgb(43, 203, 64)';
                span.innerHTML = 'No Bans for this player.';
            }

            friend.querySelector('.friendSmallText').appendChild(span);
        });
    }

    function onData(xmlHttp) {
        if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
            var data = JSON.parse(xmlHttp.responseText);
            data.forEach(setVacation);
        }
    }

    function makeApiCall(ids) {
        var xmlHttp = new XMLHttpRequest();
        var endpoint = 'https://thermal-scene-99714.appspot.com';
        var params = "steamids=" + ids.join(',');
        
        xmlHttp.onreadystatechange = function() { onData(xmlHttp); };
        xmlHttp.open('POST', endpoint, true);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(params);
    }

  	var ids = Object.keys(lookup);
  	makeApiCall(ids);
	  	
		
	  
})();