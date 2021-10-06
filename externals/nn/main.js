var currentNetwork = {};

function downloadNN(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);


    element.style.display = 'none';
    document.body.appendChild(element);



    element.click();

    document.body.removeChild(element);
}

var NN = function (input, type) {
    this.version = 1;
    this.currentType = type;
    this.currentNetwork = input[0];
    currentNetwork = input[0];


    dataset = input[1];
}

NN.prototype.toString = function () {


    if (this.currentType === "object") {
        return "@" + (function () {

            switch (currentNetwork.configurations.activation) {
                case "sigmoid":
                    return 0;
                    break;
                case "relu":
                    return 1;
                    break;
                case "leaky-relu":
                    return 2;
                    break;
                case "tanh":
                    return 3;
                    break;
                default:
                    return 0;
                    break;
            }
        })() + "[]" + (currentNetwork.configurations.learningRate || 0.3) + "[]" + (currentNetwork.configurations.errorThresh || 0.005) + "[]" + (currentNetwork.configurations.iterations || 20000) + "[]" + (currentNetwork.configurations.momentum || 0.1) + "|" + (function () {
            var returnString = "";


            dataset.map(function (indice) {
                if (indice) {
                    returnString += ("x:" + indice.input.join(","));
                    returnString += ";";
                    returnString += ("y:" + indice.output.join(","));
                    returnString += "[]";
                }

            });

            return returnString;
        })()
    }

    this.currentNetwork = currentNetwork;


    this.currentType = "string";
    return this.currentNetwork;


}

NN.prototype.toFile = function (filename) {
    var blobFile;

    if (this.currentType === "object") {

        this.toString();
        this.currentType = "string";
    }


    if (this.currentType === "string") {
        downloadNN(filename + ".nn", this.currentNetwork);

    }

    this.currentType = "file";
}

NN.prototype.toObject = function () {

    var configurations = [];
    var data = [];

    if (this.currentType === "string") {

        console.log(this.currentNetwork);

        configurations = this.currentNetwork.substr(1).split("|")[0].split("[]");

        console.log(configurations, "H", this.currentNetwork);

        data = this.currentNetwork.split("|")[1].split("[]");

        this.currentNetwork = {
            configurations: {
                activation: undefined,
                learningRate: undefined,
                errorThresh: undefined,
                iterations: undefined,
                momentum: undefined,
            },
            data: []
        };

        currentNetwork = {
            configurations: {
                activation: undefined,
                learningRate: undefined,
                errorThresh: undefined,
                iterations: undefined,
                momentum: undefined,
            },
            data: []
        };

        for (var i = 0; i < configurations.length; i++) {
            switch (i) {
                case 0:
                    switch (configurations[0]) {
                        case 0:
                            this.currentNetwork.configurations.activation = "sigmoid";
                            break;
                        case 1:
                            this.currentNetwork.configurations.activation = "relu";
                            break;
                        case 2:
                            this.currentNetwork.configurations.activation = "leaky-relu";
                            break;
                        case 3:
                            this.currentNetwork.configurations.activation = "tanh";
                            break;
                        default:
                            this.currentNetwork.configurations.activation = "sigmoid";
                            break;
                    }
                    break;
                case 1:
                    this.currentNetwork.configurations.learningRate = (configurations[1] || 0.3);
                    break;
                case 2:
                    this.currentNetwork.configurations.errorThresh = (configurations[2] || 0.005);
                    break;
                case 3:
                    this.currentNetwork.configurations.iterations = (configurations[3] || 20000);
                    break;
                case 4:
                    this.currentNetwork.configurations.momentum = (configurations[4] || 0.1);
                    break;


            }
        }


        data.map((indice) => {
            if (indice) {

                this.currentNetwork.data.push({
                    input: (function () {
                        var values = indice.split(";")[0].split(":")[1].split(",");

                        if (Array.isArray(values)) {
                            return values;
                        } else {
                            return [values];
                        }
                    })(),
                    output: (function () {
                        var values = indice.split(";")[1].split(":")[1].split(",");

                        if (Array.isArray(values)) {
                            return values;
                        } else {
                            return [values];
                        }
                    })()
                })
            }
        });

        console.log("D:", data);

    }

    this.currentType = "object"
    return this.currentNetwork;
}
