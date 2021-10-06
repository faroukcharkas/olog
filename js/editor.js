var local = (function () {
    return {
        raw_user: {
            barebone: {},
            extra: {}
        },
        network: {
            raw: {},
            complex: new brain.NeuralNetwork(),
            meta: {
                maximumX: 0,
                maximumY: 0,
                dataset: []
            }
        },
        modal: {
            raw: {},
        },
        toolbar: {
            undo: {
                present: true,
                doTrack: []
            }
        },
        page: {
            lastSave: {
                title: "",
                html: ""
            }
        }
    }
})();

function translateTime(timestamp) {
    var hours = (timestamp).getHours();
    var minutes = (timestamp).getMinutes();
    var translatedTime = "";
    if (hours > 12) {
        translatedTime += hours - 12;
    } else if (hours == 0) {
        translatedTime += "12"
    } else {
        translatedTime += hours;
    }
    translatedTime += ":"
    if (minutes > 9) {
        translatedTime += minutes;
    } else {
        translatedTime += ("0" + minutes);
    }
    if ((timestamp).getHours() >= 12) {
        translatedTime += " PM";
    } else {
        translatedTime += " AM";
    }
    return translatedTime;
}

function clearNodeSelections() {
    if (document.getElementById("textWrapper__outputInput").dataset.action.trim() != "") {
        document.getElementById(document.getElementById("textWrapper__outputInput").dataset.action).classList.remove("node-selected");
    }
    if (document.getElementById("textWrapper__inputInput").dataset.action.trim() != "") {
        document.getElementById(document.getElementById("textWrapper__inputInput").dataset.action).classList.remove("node-selected");
    }
}

function manageToolbarButtons() {
    document.getElementById("main-toolbar__createInputButtonWrapper").style.display = "block";
    document.getElementById("main-toolbar__createOutputButtonWrapper").style.display = "block";
    for (var i = 0; i < document.getElementById("main-editor").childNodes.length; i++) {
        if (document.getElementById("main-editor").childNodes[i].dataset.layertype === "input") {
            document.getElementById("main-toolbar__createInputButtonWrapper").style.display = "none";
        } else if (document.getElementById("main-editor").childNodes[i].dataset.layertype === "output") {
            document.getElementById("main-toolbar__createOutputButtonWrapper").style.display = "none";
        }
    }
}
window.location.hash = localStorage.getItem("n_id");
document.getElementById("title-wrapper__title").innerHTML = (localStorage.getItem("n_title") || "Untitled Network");
document.title = (localStorage.getItem("n_title") || "Untitled Network") + " · Olog";
document.getElementById("title-wrapper__title").innerHTML = (localStorage.getItem("n_title") || "Untitled Network");
tippy("#profileIcon-wrapper__profileIcon", {
    flip: true,
    html: "#template-accountDropdown",
    arrow: true,
    trigger: "click",
    interactive: true
});
document.getElementById("main-editor").getInputs = function () {
    var networkLayers = document.getElementById("main-editor").childNodes;
    var returnArray = [];
    for (var i = 0; i < networkLayers.length; i++) {
        if (networkLayers[i].tagName === 'DIV') {
            if (networkLayers[i].dataset.layertype === "input" && networkLayers[i]) {
                for (var j = 0; j < networkLayers[i].childNodes[0].childNodes.length; j++) {
                    //Iterate through nodes inside layer
                    returnArray.push(networkLayers[i].childNodes[0].childNodes[j].childNodes[0].innerHTML);
                }
                return returnArray;
            }
        }
    }
}
document.getElementById("main-editor").getHiddenLayers = function () {
    var networkLayers = document.getElementById("main-editor").childNodes;
    var returnArray = [];
    for (var i = 0; i < networkLayers.length; i++) {
        if (networkLayers[i].tagName === 'DIV') {
            if (networkLayers[i].dataset.layertype === "hidden" && networkLayers[i]) {
                returnArray.push(networkLayers[i].childNodes[0].childNodes.length);
            }
        }
    }
    return returnArray;
}
document.getElementById("main-editor").getOutputs = function () {
    var networkLayers = document.getElementById("main-editor").childNodes;
    var returnArray = [];
    for (var i = 0; i < networkLayers.length; i++) {
        if (networkLayers[i].tagName === 'DIV') {
            if (networkLayers[i].dataset.layertype === "output" && networkLayers[i]) {
                for (var j = 0; j < networkLayers[i].childNodes[0].childNodes.length; j++) {
                    //Iterate through nodes inside layer
                    document.getElementById("runNetworkButtonWrapper__runNetworkButton").dataset.target = networkLayers[i].childNodes[0].childNodes[j].id;
                    returnArray.push(networkLayers[i].childNodes[0].childNodes[j].childNodes[0].innerHTML);
                }
                return returnArray;
            }
        }
    }
}
document.getElementById("main-editor").standardizeUnits = function () {
    var returnObject = {
        input: [],
        output: []
    }
    try {
        local.network.meta.maximumX = document.getElementById("main-editor").getInputs().sort(function (a, b) {
            return a - b;
        })[0];
        local.network.meta.maximumY = document.getElementById("main-editor").getOutputs().sort(function (a, b) {
            return a - b;
        })[0];
        returnObject.input = document.getElementById("main-editor").getInputs().map(function (indice) {
            return indice / local.network.meta.maximumX;
        });
        returnObject.output = document.getElementById("main-editor").getOutputs().map(function (indice) {
            return indice / local.network.meta.maximumY;
        })
    } catch (error) {}
    return returnObject;
}
document.getElementById("main-editor").trainNetwork = function () {
    document.getElementById("trainingErrorText__trainingError").innerHTML = "network is training";
    document.getElementById("iterationsText__iterations").innerHTML = "network is training";
    var trainingResults = {};
    trainingResults = local.network.complex.train([document.getElementById("main-editor").standardizeUnits()], {
        learningRate: local.network.raw.configurations.learningRate,
        errorThresh: local.network.raw.configurations.errorThresh,
        iterations: local.network.raw.configurations.iterations,
        momentum: local.network.raw.configurations.momentum
    });
    local.network.meta.dataset.push({
        input: document.getElementById("main-editor").getInputs(),
        output: document.getElementById("main-editor").getOutputs()
    });
    document.getElementById("trainingErrorText__trainingError").innerHTML = trainingResults.error;
    document.getElementById("iterationsText__iterations").innerHTML = trainingResults.iterations;
}
document.getElementById("main-editor").runNetwork = function () {
    //Show user that the network is running
    var inputObject = {};
    var networkResults = local.network.complex.run(document.getElementById("main-editor").getInputs());
    document.getElementById(document.getElementById("runNetworkButtonWrapper__runNetworkButton").dataset.target).childNodes[0].innerHTML = (networkResults[0] * local.network.meta.maximumY);
}
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        //Localize the user
        local.raw_user.barebone = user;
        firebase.database().ref("members/" + local.raw_user.barebone.uid).once("value").then(function (data) {
            //Localize extra data
            local.raw_user.extra = data.val();
            //Setting profile photo for user
            document.getElementById("profileIcon-wrapper__profileIcon").src = (data.val().accountPhoto || "assets/noIcon.png");
        });
        firebase.database().ref("networks/" + user.uid + "/" + window.localStorage.getItem("n_id")).once("value", function (data) {
            local.network.raw = data.val();
            try {
                local.network.meta.dataset = (new NN([local.network.raw.data], "string")).toObject().data;
            } catch (error) {}
            document.getElementById("saveFeedback-wrapper__saveFeedback").innerHTML = "Was saved " + (relativeDate(local.network.raw.lastEdited, (new Date()))).toLowerCase();
            document.getElementById("main-editor").innerHTML = (local.network.raw.html || "");


            local.page.lastSave = {
                title: (localStorage.getItem("n_title") || "Untitled Network"),
                html: (local.network.raw.html || "")
            };


            manageToolbarButtons();
            //General Click-event Listeners
            document.body.addEventListener("click", function (element) {
                document.getElementById("node-contextmenu").style.display = "none";
                document.getElementById("wrapper-contextmenu").style.display = "none";
                if (local.page.lastSave.html != document.getElementById("main-editor").innerHTML.trim() || local.page.lastSave.title != document.getElementById("title-wrapper__title").innerHTML.trim()) {
                    firebase.database().ref("networks/" + local.raw_user.barebone.uid + "/" + local.network.raw.nid).update({
                        data: (new NN([local.network.raw, local.network.meta.dataset], "object").toString()),
                        lastEdited: Date.parse(new Date),
                        html: document.getElementById("main-editor").innerHTML.trim(),
                        title: document.getElementById("title-wrapper__title").innerHTML.trim()
                    });
                    local.network.raw.lastEdited = Date.parse(new Date());

                    local.page.lastSave = {
                        title: document.getElementById("title-wrapper__title").innerHTML.trim(),
                        html: document.getElementById("main-editor").innerHTML.trim()
                    }

                    setInterval(function () {
                        document.getElementById("saveFeedback-wrapper__saveFeedback").innerHTML = "Automatically saved " + (relativeDate(local.network.raw.lastEdited, (new Date()))).toLowerCase();

                    }, 1000);

                } else if (element.target.id === "main-toolbar__undoButtonWrapper" || element.target.id === "undoButtonWrapper__undoButton") {} else if (element.target.id === "main-toolbar__redoButtonWrapper" || element.target.id === "redoButtonWrapper__redoButton") {}
            });
            //Modal Click-event Listeners
            document.body.addEventListener("click", function (element) {
                //Account Management Modal
                if (element.target.id === "accountDropdown__accessProfile") {
                    global.modal.create({
                        title: "Change Profile",
                        closerText: "CLOSE",
                        submitterText: "APPLY",
                        content: '<label for="firstName" class="universal__inputLabel">FIRST NAME</label><input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="profile-firstName" name="firstName" type="text" class="universal__standardTextInput" placeholder="First Name" value="' + local.raw_user.extra.firstname + '"><label for="lastName" class="universal__inputLabel">LAST NAME</label><input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="profile-lastName" name="lastName" value="' + local.raw_user.extra.lastname + '" type="text" class="universal__standardTextInput" placeholder="Last Name"><label for="accountPhoto" class="universal__inputLabel">AVATAR IMAGE</label><input autocomplete="off" autocorrect="off" value="' + (data.val().accountPhoto || "") + '" autocapitalize="off" spellcheck="false" id="profile-avatarUrl" name="accountPhoto" type="text" class="universal__standardTextInput" placeholder="Avatar URL">',
                        purpose: "applyProfile",
                        action: local.raw_user.barebone.uid
                    })
                }
                //Network Settings Modal
                if (element.target.id === "settingsButtonWrapper__settingsButton") {
                    global.modal.create({
                        title: "Network Settings",
                        closerText: "CLOSE",
                        submitterText: "APPLY",
                        content: '<label for="functionSelect" class="universal__inputLabel">ACTIVATION FUNCTION</label><br><select id="settings-activation" name="functionSelect" class="universal__selection"><option value="sigmoid" id="option-sigmoid">Sigmoid</option><option value="relu" id="option-relu">Rectified Linear Unit</option><option value="leaky-relu" id="option-leaky-relu">Leaky Rectified Linear Unit</option><option value="tanh" id="option-tanh">Hyperbolic Tangent</option></select><br><label for="learningRate" class="universal__inputLabel">LEARNING RATE</label><input autocomplete="off" autocorrect="off" value="' + (local.network.raw.configurations.learningRate || 0.3) + '" autocapitalize="off" spellcheck="false" id="settings-learningRate" name="learningRate" type="text" class="universal__standardTextInput" placeholder="Learning Rate"></select><br><label for="errorThreshold" class="universal__inputLabel">ERROR THRESHOLD</label><input autocomplete="off" autocorrect="off" value="' + (local.network.raw.configurations.errorThresh || 0.005) + '" autocapitalize="off" spellcheck="false" id="settings-errorThreshold" name="errorThreshold" type="text" class="universal__standardTextInput" placeholder="Error Threshold"><label for="iterations" class="universal__inputLabel">ITERATIONS</label><input autocomplete="off" autocorrect="off" value="' + (local.network.raw.configurations.iterations || 20000) + '" autocapitalize="off" spellcheck="false" id="settings-iterations" name="iterations" type="text" class="universal__standardTextInput" placeholder="Iterations"><label for="momentum" class="universal__inputLabel">MOMENTUM</label><input autocomplete="off" autocorrect="off" value="' + (local.network.raw.configurations.momentum || 0.1) + '" autocapitalize="off" spellcheck="false" id="settings-momentum" name="momentum" type="text" class="universal__standardTextInput" placeholder="Momentum">',
                        purpose: "applySettings",
                        action: local.network.raw.nid
                    });

                    document.getElementById("settings-activation").value = (local.network.raw.activation || "sigmoid");
                    document.getElementById("settings-learningRate").value = (local.network.raw.learningRate || 0.3);
                    document.getElementById("settings-errorThreshold").value = (local.network.raw.errorThresh || 0.005);
                    document.getElementById("settings-iterations").value = (local.network.raw.iterations || 20000);
                    document.getElementById("settings-momentum").value = (local.network.raw.momentum || 0.1);
                    document.getElementById("option-" + local.network.raw.configurations.activation).selected = "true";
                }
                if (element.target.id === "modal-closer-wrapper__modal-closer" || element.target.id === "main-modal__blackAnullment") {
                    global.modal.destroy();
                } else if (element.target.id === "modal-closer-wrapper__modal-submitter") {
                    if (local.modal.raw.purpose === "applyProfile") {
                        firebase.database().ref("members/" + local.raw_user.barebone.uid).update({
                            firstname: document.getElementById("profile-firstName").value,
                            lastname: document.getElementById("profile-lastName").value,
                            accountPhoto: document.getElementById("profile-avatarUrl").value
                        });
                    } else if (local.modal.raw.purpose === "applySettings") {

                        var updatedSettings = {
                            activation: document.getElementById("settings-activation").options[document.getElementById("settings-activation").selectedIndex].value,
                            learningRate: parseFloat(document.getElementById("settings-learningRate").value),
                            errorThresh: parseFloat(document.getElementById("settings-errorThreshold").value),
                            iterations: parseFloat(document.getElementById("settings-iterations").value),
                            momentum: parseFloat(document.getElementById("settings-momentum").value)
                        }

                        firebase.database().ref("networks/" + local.raw_user.barebone.uid + "/" + local.network.raw.nid).update({
                            configurations: updatedSettings
                        });

                        local.network.raw.configurations = updatedSettings;

                        local.network.complex = new brain.NeuralNetwork({
                            hiddenLayers: document.getElementById("main-editor").getHiddenLayers(),
                            activation: local.network.raw.configurations.activation
                        });


                        local.network.complex.train(local.network.meta.dataset, {
                            learningRate: local.network.raw.configurations.learningRate,
                            errorThresh: local.network.raw.configurations.errorThreshold,
                            iterations: local.network.raw.configurations.iterations,
                            momentum: local.network.raw.configurations.momentum
                        });
                    }
                    global.modal.destroy();
                }
            });
            //Toolbar Click-event Listeners
            document.body.addEventListener("click", function (element) {
                if (element.target.id === "main-toolbar__createLayerButtonWrapper" || element.target.id === "createLayerButtonWrapper__createLayerButton") {
                    document.getElementById("main-editor").innerHTML += "<div class='network-layer' data-layerType='hidden'><div class='layer-nodeWrapper' id='wrapper-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "'><div class='nodeWrapper-node' id='node-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "'><span class='node-value'></span></div></div><div class='nodeWrapper-nodeAddition'>+</div></div>";
                } else if (element.target.id === "main-toolbar__createInputButtonWrapper" || element.target.id === "createInputButtonWrapper__createInputLayerButton") {
                    manageToolbarButtons();
                    document.getElementById("main-editor").innerHTML = "<div class='network-layer' data-layerType='input'><div class='layer-nodeWrapper' style='background-color: #008543' id='wrapper-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "'><div class='nodeWrapper-node' id='node-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "' ><span class='node-value'></span></div></div><div class='nodeWrapper-nodeAddition'>+</div></div>" + document.getElementById("main-editor").innerHTML;

                    document.getElementById("main-toolbar__createInputButtonWrapper").style.display = "none";

                } else if (element.target.id === "main-toolbar__createOutputButtonWrapper" || element.target.id === "createOutputButtonWrapper__createOutputLayerButton") {
                    manageToolbarButtons();
                    document.getElementById("main-editor").innerHTML += "<div class='network-layer' data-layerType='output'><div class='layer-nodeWrapper' style='background-color: #D1212E' id='wrapper-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "'><div class='nodeWrapper-node output-node' id='node-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "'><span class='node-value'></span></div></div><div class='nodeWrapper-nodeAddition' style='opacity:0; cursor: default;'>+</div></div>";

                    document.getElementById("main-toolbar__createOutputButtonWrapper").style.display = "none";

                } else if (element.target.id === "testNetworkButtonWrapper__testNetworkButton") {
                    document.getElementById("main-editor").trainNetwork();
                } else if (element.target.id === "runNetworkButtonWrapper__runNetworkButton") {
                    document.getElementById("main-editor").runNetwork();
                } else if (element.target.id === "dataButtonWrapper__dataButton") {
                    global.modal.create({
                        title: "Network Data",
                        closerText: "CLOSE",
                        submitterText: "",
                        content: '<div class="universal__tableWrapper"><table class="universal__table"><tr><th class="universal__tableHeader">INPUT</th><th class="universal__tableHeader">OUTPUT</th></tr>' + (function () {
                            var returnString = "";
                            if (local.network.meta.dataset.length === 0) {
                                returnString += (("<tr><td><i>no input yet</i></td><td><i>no output yet</i></td></tr>"))
                            } else {
                                local.network.meta.dataset.map(function (indice) {
                                    returnString += ("<tr><td>" + indice.input.join(", ") + "</td><td>" + indice.output.join(", ") + "</td></tr>");
                                });
                            }
                            return returnString;
                        })() + '</table></div>',
                        purpose: "",
                        action: null
                    });
                } else if (element.target.id === "download-wrapper__downloadButton") {
                    var downloadable = (new NN([local.network.raw, []], "object")).toFile(document.getElementById("title-wrapper__title").innerHTML);
                }
            });
            //Node Management Click-Event Listeners
            document.body.addEventListener("click", function (element) {
                try {
                    if (element.target.parentNode.parentNode.dataset.layertype === "input" && element.target.classList.contains("nodeWrapper-node")) {
                        if (element.target.classList.contains("node-selected")) {
                            element.target.classList.remove("node-selected");
                            document.getElementById("textWrapper__inputInput").dataset.action = "";
                            document.getElementById("textWrapper__inputInput").value = "";
                            document.getElementById("textWrapper__inputInput").disabled = true;
                            document.getElementById("textWrapper__outputInput").dataset.action = "";
                            document.getElementById("textWrapper__outputInput").value = "";
                            document.getElementById("textWrapper__outputInput").disabled = true;
                        } else {
                            clearNodeSelections();
                            document.getElementById("textWrapper__inputInput").dataset.action = element.target.id;
                            document.getElementById("textWrapper__inputInput").disabled = false;
                            element.target.classList.add("node-selected");
                            document.getElementById("textWrapper__inputInput").value = element.target.childNodes[0].innerHTML;
                            document.getElementById("textWrapper__inputInput").focus();
                        }
                    } else if (element.target.parentNode.parentNode.dataset.layertype === "output" && element.target.classList.contains("nodeWrapper-node")) {
                        if (element.target.classList.contains("node-selected")) {
                            element.target.classList.remove("node-selected");
                            document.getElementById("textWrapper__inputInput").dataset.action = "";
                            document.getElementById("textWrapper__inputInput").value = "";
                            document.getElementById("textWrapper__inputInput").disabled = true;
                            document.getElementById("textWrapper__outputInput").dataset.action = "";
                            document.getElementById("textWrapper__outputInput").value = "";
                            document.getElementById("textWrapper__outputInput").disabled = true;
                        } else {
                            clearNodeSelections();
                            document.getElementById("textWrapper__outputInput").dataset.action = element.target.id;
                            document.getElementById("textWrapper__outputInput").disabled = false;
                            element.target.classList.add("node-selected");
                            document.getElementById("textWrapper__outputInput").value = element.target.childNodes[0].innerHTML;
                            document.getElementById("textWrapper__outputInput").focus();
                        }
                    } else if (element.target.parentNode.parentNode.dataset.layertype === "hidden" && element.target.classList.contains("nodeWrapper-node")) {
                        if (document.getElementById("textWrapper__inputInput").dataset.action != "" || document.getElementById("textWrapper__outputInput").dataset.action != "") {
                            document.getElementById(document.getElementById("textWrapper__outputInput").dataset.action).classList.remove("node-selected");
                        }
                        document.getElementById("textWrapper__inputInput").dataset.action = "";
                        document.getElementById("textWrapper__inputInput").value = "";
                        document.getElementById("textWrapper__inputInput").disabled = true;
                        document.getElementById("textWrapper__outputInput").dataset.action = "";
                        document.getElementById("textWrapper__outputInput").value = "";
                        document.getElementById("textWrapper__outputInput").disabled = true;
                    } else if (element.target.className === "nodeWrapper-nodeAddition" && element.target.parentNode.dataset.layertype != "output") {
                        element.target.parentNode.childNodes[0].innerHTML += "<div class='nodeWrapper-node' id='node-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "'><span class='node-value'></span></div>"
                    } else if (element.target.className == "network-layer" || element.target.id == "main-editor") {
                        clearNodeSelections();
                    }
                } catch (error) {}
            });
            //Context Menu Management
            document.body.addEventListener("click", function (element) {
                if (element.target.id === "node-contextmenu-delete") {

                    var layer = document.getElementById(element.target.parentNode.dataset.action).parentNode.parentNode;

                    layer.childNodes[0].removeChild(document.getElementById(element.target.parentNode.dataset.action));

                    if (layer.childNodes[0].innerHTML.trim() === "") {
                        document.getElementById("main-editor").removeChild(layer);
                    }

                    document.getElementById(element.target.parentNode.dataset.action);

                    manageToolbarButtons();
                } else if (element.target.id === "wrapper-contextmenu-delete") {
                    document.getElementById(element.target.parentNode.dataset.action).parentNode.parentNode.removeChild(document.getElementById(element.target.parentNode.dataset.action).parentNode);
                    document.getElementById("wrapper-contextmenu").style.display = "none";
                    manageToolbarButtons();
                }
            });
            //Context Menu
            document.body.addEventListener("contextmenu", function (element) {
                document.getElementById("node-contextmenu").style.display = "none";
                document.getElementById("wrapper-contextmenu").style.display = "none";
                if (element.target.className === "nodeWrapper-node") {
                    element.preventDefault();
                    document.getElementById("node-contextmenu").style.top = element.clientY + "px";
                    document.getElementById("node-contextmenu").style.left = element.clientX + "px";
                    document.getElementById("node-contextmenu").style.display = "block";
                    document.getElementById("node-contextmenu").dataset.action = element.target.id;
                } else if (element.target.className === "layer-nodeWrapper") {
                    element.preventDefault();
                    document.getElementById("wrapper-contextmenu").style.top = element.clientY + "px";
                    document.getElementById("wrapper-contextmenu").style.left = element.clientX + "px";
                    document.getElementById("wrapper-contextmenu").style.display = "block";
                    document.getElementById("wrapper-contextmenu").dataset.action = element.target.id;
                } else if (element.target.className === "node-value") {
                    element.preventDefault();
                    document.getElementById("node-contextmenu").style.top = element.clientY + "px";
                    document.getElementById("node-contextmenu").style.left = element.clientX + "px";
                    document.getElementById("node-contextmenu").style.display = "block";
                    document.getElementById("node-contextmenu").dataset.action = element.target.parentNode.id;
                }
            });
            //Input management
            $("#textWrapper__inputInput").bind("input", function () {
                var networkLayers = document.getElementById("main-editor").childNodes;
                for (var i = 0; i < networkLayers.length; i++) {
                    if (networkLayers[i].tagName) {
                        for (var j = 0; j < networkLayers[i].childNodes[0].childNodes.length; j++) {
                            if (networkLayers[i].childNodes[0].childNodes[j].classList.contains("node-selected")) {
                                networkLayers[i].childNodes[0].childNodes[j].childNodes[0].innerHTML = document.getElementById("textWrapper__inputInput").value
                            }
                        }
                    }
                }
            });
            //Output management
            $("#textWrapper__outputInput").bind("input", function () {
                var networkLayers = document.getElementById("main-editor").childNodes;
                for (var i = 0; i < networkLayers.length; i++) {
                    if (networkLayers[i].tagName) {
                        for (var j = 0; j < networkLayers[i].childNodes[0].childNodes.length; j++) {
                            if (networkLayers[i].childNodes[0].childNodes[j].classList.contains("node-selected")) {
                                networkLayers[i].childNodes[0].childNodes[j].childNodes[0].innerHTML = document.getElementById("textWrapper__outputInput").value
                            }
                        }
                    }
                }
            });
        });
    } else {
        window.location.href = "oauth.html";
    }
})
