import * as graphUtils from "../src/utils.js";

// Global variables
var SAVE_GRAPH_EXTENSION = '_GENCOVERY';

/**
 * Calls functions to save displayed graph as a new JSON file
 */

function saveGraphToJSON() {
    console.log("save graph");
    var ForceObject = graphUtils.get3dForceObject();
    graphUtils.modifyJSONObject(ForceObject);
    graphUtils.createNewFile(SAVE_GRAPH_EXTENSION);
}

/**
 * Loads files selected by the user and calls conversion function
 */
function loadFileAsText() {
    var textFiles = [];
    window.JSON_OBJECT = {};
    var filesToLoad = document.getElementById("files").files;
    var fileReader = new FileReader();
    function readFile(index) {
        if (index >= filesToLoad.length) {
            jsonFileToGraph();
            return;
        }

        var file = filesToLoad[index];
        var fileName = file.name;
        var re = /(\w+)\.json/;

        var fileNameWithoutExtension = fileName.replace(re, '$1');
        fileReader.onload = function (fileLoadedEvent) {
            var content = fileLoadedEvent.target.result;
            textFiles.push(content);
            window.JSON_OBJECT[fileNameWithoutExtension] = content;
            readFile(index + 1);
        };
        fileReader.readAsText(file, "UTF-8");

    }
    readFile(0);
}

/**
 * Displays graphs and loads elements information on click
 * 
 * @param {Object} object 3D-Force object which contains nodes and links data
 * @param {Map} map Map object which contains the pathways data
 */

function displayGraph(object, map) {
    window.GRAPH = ForceGraph3D();
    window.GRAPH(document.getElementById('graph-3d'))
        .nodeThreeObject(({ group }) => new THREE.Mesh(
            [
                graphUtils.formNode(document.getElementById("nodeMgeometry-select").value, 6),
                graphUtils.formNode(document.getElementById("nodeRgeometry-select").value, 0)
            ][group % 2], [
                new THREE.MeshBasicMaterial({ color: document.getElementById("nodeMcolor-select").value }),
                new THREE.MeshBasicMaterial({ color: document.getElementById("nodeRcolor-select").value })
            ][group % 2]))
        .graphData(object)
        .onNodeClick(node => {
            console.log(node);
            var graph = map.getGraphById(node.graph_id);
            var element = graph.getElementsByName(node.name);
            document.getElementById("selected-node-name").innerHTML = " name : " + element.name;
            document.getElementById("selected-node-id").innerHTML = "id : " + element.id;
            document.getElementById("selected-node-pathway").innerHTML = "pathway : " + element.parent.name;
        })
        .onNodeDragEnd(node => {
            node.fx = node.x;
            node.fy = node.y;
            node.fz = node.z;

        });

    if (document.getElementById("link-select").value === "arrow") {
        graphUtils.arrowlink(window.GRAPH(document.getElementById('graph-3d')));
    }
    if (document.getElementById("link-select").value === "particle") {
        graphUtils.particuleLink(window.GRAPH(document.getElementById('graph-3d')));
    }

}

/**
 * Return cofactors' id in list with user selection on interface
 * 
 * @return {Object} Cofactors List
 */
function getCofactList() {
    var cofact_list = [];
    if (document.querySelector('input[id="all"]').checked) {
        cofact_list = ["h_e", "h_c", "co2_e", "co2_c", "h2o_e", "h2o_c", "atp_e", "atp_c", "adp_e", "adp_c"];
    }
    else {
        if (document.querySelector('input[id="h"]').checked) {
            cofact_list.push("h_e");
            cofact_list.push("h_c");
        }
        if (document.querySelector('input[id="h2o"]').checked) {
            cofact_list.push("h2o_e");
            cofact_list.push("h2o_c");
        }
        if (document.querySelector('input[id="co2"]').checked) {
            cofact_list.push("co2_e");
            cofact_list.push("co2_c");
        }
        if (document.querySelector('input[id="atp"]').checked) {
            cofact_list.push("atp_e");
            cofact_list.push("atp_c");
        }
        if (document.querySelector('input[id="adp"]').checked) {
            cofact_list.push("adp_e");
            cofact_list.push("adp_c");
        }
    }
    return cofact_list;
}

/**
 * Reads and parses JSON file, to display the graph
 */
export function jsonFileToGraph() {
    graphUtils.stringToJSON();
    var mapCreatedByParseJSON = graphUtils.parseJSON();
    var object = graphUtils.duplicreate3dForceObject(mapCreatedByParseJSON, getCofactList());
    displayGraph(object, mapCreatedByParseJSON);
}

/**
 * Applies custom changes on curent graph
 */
function graphChange() {
    var map = graphUtils.parseJSON();
    var obj = graphUtils.get3dForceObject();
    if (getCofactList().length != 0) {
        obj = graphUtils.duplicreate3dForceObject(map, getCofactList());
    }
    displayGraph(obj, map);
}


document.getElementById('ok').addEventListener('click', loadFileAsText);
document.getElementById('new').addEventListener('click', loadFileAsText);
document.getElementById('change').addEventListener('click', graphChange);
document.getElementById('saveGraph').addEventListener('click', saveGraphToJSON);