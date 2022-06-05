function log(message) {
	if (debug) {
		console.log(message);
	}
}

// Get URL Parameters (Credit to html-online.com)
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
}

function getUrlParam(parameter, defaultvalue) {
	var urlparameter = defaultvalue;
	if (window.location.href.indexOf(parameter) > -1) {
		urlparameter = getUrlVars()[parameter];
	}
	return urlparameter;
}

let emotes = [];
async function getEmotes(check) {
	function returnResponse(response) {
		return response.json();
	}

	function logError(error) {
		log(error.message);
	}

	// const proxyurl = 'https://cors-anywhere.herokuapp.com/';
	const proxyurl = "https://tpbcors.herokuapp.com/";
	let twitchID;
	let totalErrors = [];

	// get channel twitch ID
	let res = await fetch(proxyurl + "https://api.ivr.fi/twitch/resolve/" + channel, {
		method: "GET",
		headers: {
			"User-Agent": "api.roaringiron.com/emoteoverlay"
		},
	}).then(returnResponse, logError);
	if (!res.error || res.status == 200) {
		twitchID = res.id;
	} else {
		totalErrors.push("Error getting twitch ID");
	}

	// get FFZ emotes
	res = await fetch(proxyurl + "https://api.frankerfacez.com/v1/room/" + channelFFZ, {
		method: "GET",
	}).then(returnResponse, logError);
	if (!res.error) {
		let setName = Object.keys(res.sets);
		for (var k = 0; k < setName.length; k++) {
			for (var i = 0; i < res.sets[setName[k]].emoticons.length; i++) {
				const emoteURL = res.sets[setName[k]].emoticons[i].urls["2"] ?
					res.sets[setName[k]].emoticons[i].urls["2"] :
					res.sets[setName[k]].emoticons[i].urls["1"];
				let emote = {
					emoteName: res.sets[setName[k]].emoticons[i].name,
					emoteURL: "https://" + emoteURL.split("//").pop(),
				};
				emotes.push(emote);
			}
		}
	} else {
		totalErrors.push("Error getting ffz emotes");
	}
	// get all global ffz emotes
	res = await fetch(proxyurl + "https://api.frankerfacez.com/v1/set/global", {
		method: "GET",
	}).then(returnResponse, logError);
	if (!res.error) {
		let setName = Object.keys(res.sets);
		for (var k = 0; k < setName.length; k++) {
			for (var i = 0; i < res.sets[setName[k]].emoticons.length; i++) {
				const emoteURL = res.sets[setName[k]].emoticons[i].urls["2"] ?
					res.sets[setName[k]].emoticons[i].urls["2"] :
					res.sets[setName[k]].emoticons[i].urls["1"];
				let emote = {
					emoteName: res.sets[setName[k]].emoticons[i].name,
					emoteURL: "https://" + emoteURL.split("//").pop(),
				};
				emotes.push(emote);
			}
		}
	} else {
		totalErrors.push("Error getting global ffz emotes");
	}
	// get all BTTV emotes
	res = await fetch(proxyurl + "https://api.betterttv.net/3/cached/users/twitch/" + twitchID, {
		method: "GET",
	}).then(returnResponse, logError);
	if (!res.message) {
		for (var i = 0; i < res.channelEmotes.length; i++) {
			let emote = {
				emoteName: res.channelEmotes[i].code,
				emoteURL: `https://cdn.betterttv.net/emote/${res.channelEmotes[i].id}/2x`,
			};
			emotes.push(emote);
		}
		for (var i = 0; i < res.sharedEmotes.length; i++) {
			let emote = {
				emoteName: res.sharedEmotes[i].code,
				emoteURL: `https://cdn.betterttv.net/emote/${res.sharedEmotes[i].id}/2x`,
			};
			emotes.push(emote);
		}
		log(emotes);
	} else {
		totalErrors.push("Error getting bttv emotes");
	}
	// global bttv emotes
	res = await fetch(proxyurl + "https://api.betterttv.net/3/cached/emotes/global", {
		method: "GET",
	}).then(returnResponse, logError);
	if (!res.message) {
		for (var i = 0; i < res.length; i++) {
			let emote = {
				emoteName: res[i].code,
				emoteURL: `https://cdn.betterttv.net/emote/${res[i].id}/2x`,
			};
			emotes.push(emote);
		}
		log(emotes);
	} else {
		totalErrors.push("Error getting global bttv emotes");
	}
	if (channel7TV) {
		// get all 7TV emotes
		res = await fetch(proxyurl + `https://api.7tv.app/v2/users/${channel7TV}/emotes`, {
			method: "GET",
		}).then(returnResponse, logError);
		if (!res.error || res.status == 200) {
			if (res.Status === 404) {
				totalErrors.push("Error getting 7tv emotes");
			} else {
				for (var i = 0; i < res.length; i++) {
					let emote = {
						emoteName: res[i].name,
						emoteURL: res[i].urls[1][1],
					};
					emotes.push(emote);
				}
			}
		} else {
			totalErrors.push("Error getting 7tv emotes");
		}
		// get all 7TV global emotes
		res = await fetch(proxyurl + `https://api.7tv.app/v2/emotes/global`, {
			method: "GET",
		}).then(returnResponse, logError);
		if (!res.error || res.status == 200) {
			if (res.Status === 404) {
				totalErrors.push("Error getting 7tv global emotes");
			} else {
				for (var i = 0; i < res.length; i++) {
					let emote = {
						emoteName: res[i].name,
						emoteURL: res[i].urls[1][1],
					};
					emotes.push(emote);
				}
			}
		} else {
			totalErrors.push("Error getting 7tv global emotes");
		}
	}
	if (totalErrors.length > 0) {
		totalErrors.forEach((error) => {
			console.error(error);
		});
		$("#errors").html(totalErrors.join("<br />")).delay(5000).fadeOut(300);
	} else {
		$("#errors").html(`Successfully loaded ${emotes.length} emotes.`).delay(2000).fadeOut(300);
	}
}

let emoteStreaks = {}
let emoteNodes = []

function sortEmotes() {

    while (main.firstChild)
        main.removeChild(main.firstChild);

	emoteNodes = emoteNodes.sort((a, b) => {
		return a.parent.displayStreak - b.parent.displayStreak
	})

	emoteNodes.forEach((node) => {if (node.parent.displayStreak) main.appendChild(node)});
}

class Streak {

	constructor(emote, emoteURL) {
		this.emote = emote
		this.emoteURL = emoteURL


		let emoteImg = document.createElement('img')
		emoteImg.src = emoteURL
		this.emoteTxt = document.createElement('span')

		this.element = document.createElement('div')
		this.element.className = 'emoteStreak'
		this.element.appendChild(emoteImg)
		this.element.appendChild(this.emoteTxt)
		main.appendChild(this.element)

		this.element.style.display = 'none'
		this.element.parent = this

		emoteNodes.push(this.element)

		this.resetStreak()
		this.displayStreak = 0
	}

	resetStreak() {
		this.users = new Set()
		this.streak = 0
		this.clearTimer()
		clearTimeout(this.deadline)
	}

	setTimer() {
		this.clearTimer()
		this.timeout = setTimeout(() => {
			this.resetStreak()
		}, leniency * 1000)
	}

	clearTimer() {
		if (!this.timeout) return
		clearTimeout(this.timeout)
	}

	incrementStreak(user) {
		if (this.users.has(user) && userUniqueStreaks) return
		this.users.add(user)

		this.streak++
		this.setTimer()

		if (this.streak == minStreak) { // begin the deadline timer
			clearTimeout(this.deadline)
			this.deadline = setTimeout(()=>{
				this.resetStreak()
			}, streakDeadline * 1000)
		}

		if (this.streak >= minStreak)
			this.streakEvent()
	}

	streakEvent() {
		this.element.style.display = 'inline'
		this.displayStreak = this.streak
		this.emoteTxt.innerText = "x" + this.displayStreak + emoteStreakText

		this.element.style.animation = 'emoteGrow ease-in-out ' + emoteHitAnimationTime + 's'
		clearTimeout(this.hitTimeout)
		this.hitTimeout = setTimeout(() => {
			this.element.style.animation = ''
		}, emoteHitAnimationTime * 1000)

		clearTimeout(this.endTimeout)
		this.endTimeout = setTimeout(() => {
			this.element.style.animation = 'emoteFadeAway ease-in forwards ' + emoteEndAnimationTime + 's'
			this.endTimeout = setTimeout(() => {
				this.element.style.animation = ''
				this.element.style.display = 'none'
				this.displayStreak = 0
			}, emoteEndAnimationTime * 1000)
		}, endDelay * 1000)

		sortEmotes()
	}
}

let showEmoteCooldownRef = new Date(); // the emote shown from using the !showemote <emote> command

function findEmotes(message, messageFull) {
	if (emotes.length !== 0) {
		let emoteUsedPos = messageFull[4].startsWith("emotes=") ? 4 : messageFull[5].startsWith("emote-only=") ? 6 : 5;
		let emoteUsed = messageFull[emoteUsedPos].split("emotes=").pop();
		messageSplit = message.split(" ");
		if (messageFull[emoteUsedPos].startsWith("emotes=") && emoteUsed.length > 1) {

			let emote = message.substring(parseInt(emoteUsed.split(":")[1].split("-")[0]), parseInt(emoteUsed.split(":")[1].split("-")[1]) + 1);
			if (emote in emoteStreaks)
				emoteStreaks[emote].incrementStreak(messageFull[13].match(/\d+/g)[0])
			else {
				let emoteURL = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteUsed.split(":")[0]}/default/dark/2.0`;
				emoteStreaks[emote] = new Streak(emote, emoteURL)
				emoteStreaks[emote].incrementStreak(messageFull[13].match(/\d+/g)[0])
			}
		} else {

			let emote = findEmoteInMessage(messageSplit);
			if (!emote) return
			if (emote in emoteStreaks)
				emoteStreaks[emote].incrementStreak(messageFull[13].match(/\d+/g)[0])
			else {
				let emoteURL = findEmoteURLInEmotes(emote);
				emoteStreaks[emote] = new Streak(emote, emoteURL)
				emoteStreaks[emote].incrementStreak(messageFull[13].match(/\d+/g)[0])
			}
		}

		function findEmoteInMessage(message) {
			for (const emote of emotes.map((a) => a.emoteName)) {
				if (message.includes(emote)) {
					return emote;
				}
			}
			return null;
		}

		function findEmoteURLInEmotes(emote) {
			for (const emoteObj of emotes) {
				if (emoteObj.emoteName == emote) {
					return emoteObj.emoteURL;
				}
			}
			return null;
		}
	}
}

function showEmote(message, messageFull) {
	if (emotes.length !== 0 && (showEmoteEnabled == 1 || (showEmoteEnabled == 0 && messageFull[1] == 'badges=broadcaster/1'))) {
		let emoteUsedPos = messageFull[4].startsWith("emotes=") ? 4 : 5;
		let emoteUsedID = messageFull[emoteUsedPos].split("emotes=").pop();
		messageSplit = message.split(" ");
		if (emoteUsedID.length == 0) {
			let emoteUsed = findEmoteInMessage(messageSplit);
			let emoteLink = findEmoteURLInEmotes(emoteUsed);
			if (emoteLink) {
				return showEmoteEvent({emoteName: emoteUsed, emoteURL: emoteLink });
			}
		} else {
			let emoteUsed = message.substring(parseInt(emoteUsedID.split(":")[1].split("-")[0]), parseInt(emoteUsedID.split(":")[1].split("-")[1]) + 1);
			let emoteLink = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteUsedID.split(":")[0]}/default/dark/2.0`;
			return showEmoteEvent({ emoteName: emoteUsed, emoteURL: emoteLink });
		}

		function findEmoteInMessage(message) {
			for (const emote of emotes.map((a) => a.emoteName)) {
				if (message.includes(emote)) {
					return emote;
				}
			}
			return null;
		}

		function findEmoteURLInEmotes(emote) {
			for (const emoteObj of emotes) {
				if (emoteObj.emoteName == emote) {
					return emoteObj.emoteURL;
				}
			}
			return null;
		}
	}
}

function showEmoteEvent(emote) {
	let secondsDiff = (new Date().getTime() - new Date(showEmoteCooldownRef).getTime()) / 1000;
	log(secondsDiff);
	if (secondsDiff > parseInt(showEmoteCooldown)) {
		showEmoteCooldownRef = new Date();
		var image = emote.emoteURL;
		var max_height = 720;
		var max_width = 1280;

		function getRandomCoords() {
			var r = [];
			var x = Math.floor(Math.random() * max_width);
			var y = Math.floor(Math.random() * max_height);

			r = [x, y];
			return r;
		}

		function createImage() {
			$("#showEmote").empty();
			var xy = getRandomCoords();
			$("#showEmote").css("position", "absolute");
			$("#showEmote").css("top", xy[1] + "px");
			$("#showEmote").css("left", xy[0] + "px");
			log("creating showEmote");
			var img = $("<img />", {src: image, style: `transform: scale(${showEmoteSizeMultiplier}, ${showEmoteSizeMultiplier})`});
			img.appendTo("#showEmote");
			gsap.to("#showEmote", 1, {autoAlpha: 1, onComplete: anim2 });
			function anim2() {
				gsap.to("#showEmote", 1, { autoAlpha: 0, delay: 4, onComplete: remove });
			}

			function remove() {
				$("#showEmote").empty();
			}
		}
		createImage();
	}
}

// Connecting to twitch chat
function connect() {
	const chat = new WebSocket("wss://irc-ws.chat.twitch.tv");
	var timeout = setTimeout(function() {
		chat.close();
		chat.connect();
	}, 10 * 1000);

	chat.onopen = function() {
		clearInterval(timeout);
		chat.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
		chat.send("PASS oauth:xd123");
		chat.send("NICK justinfan123");
		chat.send("JOIN #" + channel);
		getEmotes();
	};

	chat.onerror = function() {
		log("There was an error.. disconnected from the IRC");
		chat.close();
		chat.connect();
	};

	chat.onmessage = function(event) {
		let messageFull = event.data.split(/\r\n/)[0].split(`;`);
		log(messageFull);
		if (messageFull.length > 12) {
			let messageBefore = messageFull[messageFull.length - 1].split(`${channel} :`).pop(); // gets the raw message
			let message = messageBefore.split(" ").includes("ACTION") ? messageBefore.split("ACTION ").pop().split("")[0] : messageBefore; // checks for the /me ACTION usage and gets the specific message
			if (message.toLowerCase().startsWith("!showemote") || message.toLowerCase().startsWith("!#showemote")) {
				showEmote(message, messageFull);
			}
			findEmotes(message, messageFull);
		}
		if (messageFull.length == 1 && messageFull[0].startsWith("PING")) {
			log("sending pong");
			chat.send("PONG");
		}
	};
}
