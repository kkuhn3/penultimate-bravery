let versions = {};
let champions = {};
let allitems = {};
let completeitems = {};
let lofilters = [];
let classfilteredto = 'all';

async function loadContent() {
	const versionRes = await fetch('https://ddragon.leagueoflegends.com/realms/na.json', {
		method: 'GET'
	});
	versions = await versionRes.json();

	const championRes = await fetch('https://ddragon.leagueoflegends.com/cdn/' + versions['n']['champion'] + '/data/en_US/champion.json', {
		method: 'GET'
	});
	champions = (await championRes.json())['data'];

	const itemRes = await fetch('https://ddragon.leagueoflegends.com/cdn/' + versions['n']['item'] + '/data/en_US/item.json', {
		method: 'GET'
	});
	allitems = (await itemRes.json())["data"];

	const includeboots = true;
	for (const [key, value] of Object.entries(allitems)) {
		// ARAM
		if (value['maps']['12']) {
			// Legendary
			if (!value['into'] || (includeboots && value['from'] && value['from'].includes("1001"))) {
				// Purchaseable
				if (value['inStore'] == undefined) {
					// Not a Consumable
					if (!value['tags'].includes('Consumable')) {
						// Not a Trinket
						if (!value['tags'].includes('Trinket')) {
							// Doran's are allowed in ARAM?
							if (!value['name'].includes("Doran's ")) {
								// What's Empyrean Promise?
								if (value['name'] !== 'Empyrean Promise') {
									completeitems[key] = value;
								}
							}
						}
					}
				}
			}
		}
	}
}

function addimgmouses() {
	classfilter.childNodes.forEach(function(node){
		onfilterhighlight(node);
		node.onclick = () => {
			if (classfilteredto != node.id) {
				classfilter.childNodes.forEach(function(childNodes){
					if (childNodes.tagName == 'IMG') {
						if (childNodes == node) {
							childNodes.src = childNodes.src.replace("0", "1");
							classfilteredto = node.id;
						}
						else {
							childNodes.src = childNodes.src.replace("1", "0");
						}
					}
				});
				applyfilters();
			}
			else if(node.id !== 'all') {
				all.onclick();
			}
		}
	});
	left.childNodes.forEach(function(node){
		if (node.nodeName === "IMG") {
			onfilterhighlight(node);
			if (node.id === 'custom_clear') {
				node.onclick = () => {
					lofilters = [];
					left.childNodes.forEach(function(node){
						if (node.nodeName === "IMG") {
							node.src = node.src.replace("1", "0");
						}
					});
					applyfilters();
				}
			}
			else {
				node.onclick = () => {
					const index = lofilters.indexOf(node.id);
					if (index > -1) {
						lofilters.splice(index, 1);
						node.src = node.src.replace("1", "0");
					}
					else {
						lofilters.push(node.id);
						node.src = node.src.replace("0", "1");
					}
					applyfilters();
				}
			}
		}
	});
}

function onfilterhighlight(filter) {
	filter.onmouseover = () => {
		filter.style.outline = "2px solid #FFE865";
		filter.style.outlineOffset = "-2px"
	};
	filter.onmouseout = () => {filter.style.outline = "none";};
}

function applyfilters() {
	for (let node of document.getElementsByClassName('item')) {
		const item = allitems[node.id];
		node.style.display = "inline-block";
		lofilters.forEach(function(filter) {
			if ("custom_movement" == filter) {
				if (!item['tags'].includes('Boots') && !item['tags'].includes('NonbootsMovement')) {
					node.style.display = "none";
				}
			}
			else if (!item['tags'].includes(filter)) {
				node.style.display = "none";
			}
		});
		if ('all' != classfilteredto) {
			if ('fighter' == classfilteredto) {
				if (!item['tags'].includes('Damage') || (!item['tags'].includes('Health') && !item['tags'].includes('AbilityHaste'))) {
					node.style.display = "none";
				}
			}
			else if ('marksman' == classfilteredto) {
				if (!item['tags'].includes('CriticalStrike') && !item['tags'].includes('LifeSteal')) {
					node.style.display = "none";
				}
			}
			else if ('assassin' == classfilteredto) {
				if (!item['tags'].includes('ArmorPenetration')) {
					node.style.display = "none";
				}
			}
			else if ('mage' == classfilteredto) {
				if (!item['tags'].includes('SpellDamage') && !item['tags'].includes('MagicPenetration')) {
					node.style.display = "none";
				}
			}
			else if ('tank' == classfilteredto) {
				if (!item['tags'].includes('HealthRegen') && !item['tags'].includes('Armor') && !item['tags'].includes('SpellBlock')) {
					node.style.display = "none";
				}
			}
			else {
				if (!item['description'].includes('Heal and Shield')) {
					node.style.display = "none";
				}
			}
		}
	};
	hideifempty(starter, starterContainer);
	hideifempty(basic, commonContainer);
	hideifempty(epic, epicContainer);
	hideifempty(legendary, legendaryContainer);
}

function hideifempty(parent, container) {
	parent.style.display = "none";
	for (let node of container.childNodes) {
		if (node.tagName == 'DIV' && node.classList.contains("item") && "none" != node.style.display) {
			parent.style.display = "block";
			break;
		}
	}
}

function randomBoth() {
	const championKeys = selectrandom(champions, 3);
	championsContainer.innerHTML = "";
	championKeys.forEach((element) => {
		championsContainer.innerHTML += championDiv(element);
	});

	let itemKeys = selectrandom(completeitems, 9);
	itemKeys = selectsubitems(itemKeys);
	itemKeys = [... new Set(itemKeys)];
	itemKeys.sort(compareitems);
	starterContainer.innerHTML = "";
	commonContainer.innerHTML = "";
	epicContainer.innerHTML = "";
	legendaryContainer.innerHTML = "";
	itemKeys.forEach((element) => {
		item = allitems[element];
		if (item['name'].includes('Guardian') || item['name'] === 'Tear of the Goddess' || item['tags'].includes('Boots')) {
			starterContainer.innerHTML += itemDiv(element);
		}
		else if (item['from']) {
			if (item['into']) {
				epicContainer.innerHTML += itemDiv(element);
			}
			else {
				legendaryContainer.innerHTML += itemDiv(element);
			}
		}
		else {
			commonContainer.innerHTML += itemDiv(element);
		}
	});
	addItemInfos();
	applyfilters();
}

function selectrandom(obj, amount) {
	const keys = Object.keys(obj);
	const chosenKeys = [];
	if (keys.length <= amount) {
		chosenKeys.push(keys);
		return chosenKeys;
	}
	for (let i = 0; i < amount; i++) {
		let key = keys[ keys.length * Math.random() << 0];
		while (chosenKeys.includes(key)) {
			key = keys[ keys.length * Math.random() << 0];
		}
		chosenKeys.push(key);
	}
	return chosenKeys;
}

function selectsubitems(itemKeys) {
	let newKeys = [];
	itemKeys.forEach((element) => {
		const item = allitems[element];
		if (item["from"]) {
			const from = item["from"].filter(function(el) { return el != []; });
			if (from.length > 0) {
				newKeys = newKeys.concat(selectsubitems(from));
			}
		}
	});
	return itemKeys.concat(newKeys);
}

function compareitems(a, b) {
	return allitems[a]['gold']['total'] - allitems[b]['gold']['total'];
}

function itemDiv(itemId) {
	return `
		<div id='` + itemId + `' class="item">
			<img id='` + itemId + `_img' src='https://ddragon.leagueoflegends.com/cdn/` + versions['n']['item'] + `/img/item/` + itemId + `.png'/>
			` + allitems[itemId]['gold']['total'] + `
		</div>`;
}

function championDiv(championId) {
	return `
		<div id='` + championId + `' class="champion">
			<img id='` + championId + `_img' src='https://ddragon.leagueoflegends.com/cdn/` + versions['n']['champion'] + `/img/champion/` + championId + `.png'/>
			` + champions[championId]['name'] + `
		</div>`;
}

function addItemInfos() {
	const itemDivs = document.getElementsByClassName("item");
	for (let itemDiv of itemDivs) {
		let info = document.createElement('div');
		info.className = "info";
		info.id = "info_" + itemDiv.id;
		info.style.display = "none";
		itemDiv.parentElement.appendChild(info);
		itemDiv.onmouseover = () => {
			sizeInfo(info, itemDiv);
			info.style.display = "inline-block";
		};
		itemDiv.onmouseout = () => {info.style.display = "none";};
		info.innerHTML = allitems[itemDiv.id]['name'] + '<hr>';
		if (allitems[itemDiv.id]['plaintext']) {
			info.innerHTML += '<span>' + allitems[itemDiv.id]['plaintext'] + '</span>';
		}
	}
}

function sizeInfo(info, itemDiv) {
	const width = window.innerWidth;
	const height = window.innerHeight;
	// bottom half
	if (itemDiv.offsetTop > height / 2) {
		info.style.bottom = height - itemDiv.offsetTop - (height / 100) * 4.5;
		info.style.top = 'unset';
	}
	// top half
	else {
		info.style.top = itemDiv.offsetTop + (height / 100) * 4.5;
		info.style.bottom = 'unset';
	}
	// right half
	if (itemDiv.offsetLeft > width / 2) {
		info.style.right = width - itemDiv.offsetLeft;
		info.style.left = 'unset';
	}
	// left half
	else {
		info.style.left = itemDiv.offsetLeft + (height / 100) * 9;
		info.style.right = 'unset';
	}
}
