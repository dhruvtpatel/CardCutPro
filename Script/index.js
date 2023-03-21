customizations = {
	presets: "None",
	font: "Times New Roman",
	cardSize: "12pt",
	highlightColor: "None",
	linkColor: "Black",
	linkCustom: "None",
	descriptionColor: "Black",
	descriptionPosition: "None",
	tagColor: "Black",
	tagAlign: "Left",
	tagSize: "12pt",
	tagCustomization: "None"
};

//We'll use this + JSON bracket notation to later modify these things
//hmm looks like it's going to be impossible to do functional programming unless we want 
//to store everything in the frontend
//Parallel array to the indexHTML order and customizations JSON
const customizationNames = [
	"presets",
	"font",
	"cardSize",
	"highlightColor",
	"linkColor",
	"linkCustom",
	"descriptionColor",
	"descriptionPosition",
	"tagColor",
	"tagAlign",
	"tagSize",
	"tagCustomization"
];

function initialize(document) 
{
	custArr = Array.from(document.getElementsByClassName("flexCard"));
	//Adds an event listener to each array and update all of their customizations
	custArr.forEach((el, idx) => {
		el.addEventListener("click", () => {
			mdcDisplay(this, idx, document);
		});
		el.querySelector(".flexVal").innerText = customizations[customizationNames[idx]];
	});
}

const mdcDisplay = (el, idx, document) => {
	//Stops scrolling
	document.body.style.overflowY = "hidden";

	//Inits the dom object. divItem is parallel to the corresponding custNames array
	const tempWrap = document.getElementById("invisFormHTML");
	const divItem = tempWrap.children[idx];

	tempWrap.style.visibility = "visible";
	divItem.style.display = "block";

	//Animation
	tempWrap.classList.add("fadeBlackIn");
	divItem.classList.add("zoomIn");

	//Add btn action - loose type saves lives :P
	//The eAdded short circuiting prevents multiple event listeners from stacking
	//!str == bool
	!!divItem.eAdded || divItem.querySelector("img").addEventListener("click", () => {
		mdcDisplaynt(document, tempWrap, divItem, idx);
	})
}

//If regularn't means former regular
//Staffn't means former staff
//Displayn't is next lmao
const mdcDisplaynt = (document, tempWrap, divItem, idx) => {

	//Animations
	tempWrap.classList.add("fadeBlackOut");
	tempWrap.classList.remove("fadeBlackIn");

	divItem.classList.add("zoomOut");
	divItem.classList.remove("zoomIn");

	//Determines the values + account for stuff if nuances exist
	let addItemDiv = divItem.querySelector(".addItem");
	let finalCustVal;

	if (addItemDiv && addItemDiv.value != "") {
		finalCustVal = addItemDiv.value;
	}
	else {
		let customizationVal = divItem.querySelector(".modalSelect").value;
		finalCustVal = divItem.classList.contains("fontNum") ? customizationVal + "pt" : customizationVal;
	}

	customizations[customizationNames[idx]] = finalCustVal;
	custArr[idx].querySelector(".flexVal").innerText = finalCustVal;

	//Async clear elements and stuff after it ends
	setTimeout(() => {
		document.body.style.overflowY = "auto";

		divItem.classList.remove("zoomOut");
		divItem.style.display = "none";

		tempWrap.classList.remove("fadeBlackOut");
		tempWrap.style.visibility = "hidden";
	}, 1000);
}

//Pure func that generates the card along with the CSS
const genCard = (inputForm, customizations) => {
	let dom = document.createElement("div");
	dom.style.fontSize = customizations.cardSize;
	dom.style.fontFamily = customizations.font;

	let tag = document.createElement("div");
	tag.innerText = inputForm.tag.value;
	tag.style.fontSize = customizations.tagSize;
	tag.style.color = customizations.tagColor;
	tag.style.textAlign = customizations.tagAlign;
	applyCustomization(tag, customizations.tagCustomization);

	let link = document.createElement("a");
	link.innerText = inputForm.author.value;
	link.addEventListener("click", () => {
		window.open(inputForm.link.value, "_blank");
	});
	link.style.color = customizations.linkColor;
	link.style.display = "block";
	applyCustomization(link, customizations.linkCustom);

	let text = document.createElement("div");
	//Offtrack - calculating the text and highlights
	//Since we split the items via \, only array idxes to the right of \ will need to be highlighted
	//Hence, only odd idxes need to get hlEl before adding to the cumulation variable

	var hlEl = `<mark style="background-color: ${customizations.highlightColor}; font-weight: bold; text-decoration:underline;">`;
	var txt = inputForm.content.value.split("\\").reduce((cum, str, idx) =>
		cum + (idx % 2 == 0 ? str : hlEl + str + `</mark>`)
		, "");
	//Resume track
	text.innerHTML = txt;

	let description = document.createElement("div");
	description.appendChild(document.createElement("br"));
	description.innerText = inputForm.desc.value;
	description.appendChild(document.createElement("br"));
	description.style.color = customizations.descriptionColor;

	dom.appendChild(tag);
	dom.appendChild(link);

	//Accounts for description position
	if (customizations.descriptionPosition == "Before") {
		dom.appendChild(description);
		dom.appendChild(text);
	}
	else {
		dom.appendChild(text);
		dom.appendChild(description);
	}

	return dom;
}

//Applies necessary customizations
const applyCustomization = (element, customizations) => {
	if (customizations.includes("Bold")) {
		element.style.fontWeight = "bold";
	}

	if (customizations.includes("Italics")) {
		element.style.fontStyle = "italic";
	}

	if (customizations.includes("Underline")) {
		element.style.textDecorationLine = "underline";
	}
}

const displayCard = (inputForm, cardItem, customizations) => {
	fetchPreset(customizations)
		.then(json => {
			let dom = genCard(inputForm, json);

			cardItem.innerHTML = "";
			cardItem.appendChild(dom);
		});
}

//Fetches the preset necessary to style the card
//Not sure if I should call this pure
function fetchPreset(customizations) 
{
	return new Promise((resolve, reject) => {
		const item = customizations.presets;

		if (item == "None") {
			resolve(customizations);
			return;
		}

		//Fetch the JSON bc I don't want to make new vars lmao
		let presetReq = fetch(`./Script/Presets/${item}.json`, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		});

		//If something wack went on with fetching, then just use the normal preset
		presetReq.catch(err => {
			console.error(err);
			console.log("Most likely, some person was messing around with the input vals >:(");
			resolve(customizations);
		})

		presetReq.then(resp => resp.json())
			.then(json => {
				resolve(json);
			})
	});
}

function deleteInput(inputForm)
{
	//Not the most D.R.Y but hey it's the fastest
	inputForm.tag.value = "";
	inputForm.author.value = "";
	inputForm.link.value = "";
	inputForm.desc.value = "";
	inputForm.content.value = "";
}

function pasteCard(clipboard, contentDiv)
{
	clipboard.readText()
		.then(txt => {
			contentDiv.value = txt;
		})
}