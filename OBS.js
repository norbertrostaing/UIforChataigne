/* ********** WEBSOCKET  MODULE SPECIFIC SCRIPTING ********************* */
/*

Streaming Modules (i.e. UDP and Serial Module) have specific methods that can be used to handle receiving and sendin data over the connection.
With streaming modules, there are 2 ways of sending data : either as a UTF-8 String or as separate bytes

local.sendBytes(30,210,46,255,10); //This will send all the bytes passed in as they are

*/

/*
You can intercept all the received data from this module with the method dataReceived(data).
Depending on the Protocol you chose, the nature of the data passed in this function will be different.
*/



/* ********** STREAMING MODULE (UDP, TCP, SERIAL, WEBSOCKET) SPECIFIC SCRIPTING ********************* */
/*

Websoskets modules can be used as standard Streaming Module and use the dataReceived function above, 
but you can also intercept messages and data directly from the streaming, before it is processed, using specific 
event callbacks below
*/



function moduleParameterChanged(param)
{
	if (param.isParameter()) {
		script.log("Module parameter changed : "+param.name+" > "+param.get());
		if (param.name == "obsIP") {
			local.parameters.serverPath.set(param.get()+":4444");
		}
	} else {
		script.log("Module parameter triggered : "+param.name);	
	}
}






function wsMessageReceived(message)
{
	script.log("Websocket data received : " +message);
}

function wsDataReceived(data)
{
	script.log("Websocket data received : " +data);
}


function sendObsCommand(req, dataUser) {
	var data = {};
	data["request-type"] = req;
	data["message-id"] = "test"+Math.random();

	var uFields = util.getObjectProperties(dataUser);
	for (var i = 0; i< uFields.length; i++) {
		data[uFields[i]] = dataUser[uFields[i]];
	}

	var str = JSON.stringify(data);
	str = str.replace('"true"', "true");
	str = str.replace('"false"', "false");

	script.log(str); 
	local.send(str); 
}

function OBSPlayMedia(source) {
	var data = {};
	data["sourceName"] = source;
	data["playPause"] = "false";
	sendObsCommand("PlayPauseMedia", data);
}

function OBSPauseMedia(source) {
	var data = {};
	data["sourceName"] = source;
	data["playPause"] = "true";
	sendObsCommand("PlayPauseMedia", data);
}

function OBSRestartMedia(source) {
	var data = {};
	data["sourceName"] = source;
	sendObsCommand("RestartMedia", data);
}

function OBSStopMedia(source) {
	var data = {};
	data["sourceName"] = source;
	sendObsCommand("StopMedia", data);
}

function OBSNextMedia(source) {
	var data = {};
	data["sourceName"] = source;
	sendObsCommand("NextMedia", data);
}

function OBSPreviousMedia(source) {
	var data = {};
	data["sourceName"] = source;
	sendObsCommand("PreviousMedia", data);
}

function OBSSetMediaTime(source, time) {
	var data = {};
	data["sourceName"] = source;
	data["timestamp"] = time;
	sendObsCommand("SetMediaTime", data);
}

function OBSScrubMedia(source, time) {
	var data = {};
	data["sourceName"] = source;
	data["timeOffset"] = time;
	sendObsCommand("ScrubMedia", data);
}

function OBSSetVolume(source, vol) {
	var data = {};
	data["source"] = source;
	data["volume"] = vol;
	data["useDecibel"] = false;
	sendObsCommand("SetVolume", data);
}

function OBSSetMute(source, val) {
	var data = {};
	data["source"] = source;
	data["mute"] = val;
	sendObsCommand("SetMute", data);
}

function OBSTakeSourceScreenshot(source, format, path) { // "png", "jpg", "jpeg" or "bmp", 
	var data = {};
	data["sourceName"] = source;
	data["embedPictureFormat"] = format;
	data["saveToFilePath"] = path;
	sendObsCommand("TakeSourceScreenshot", data);
}

function OBSRefreshBrowserSource(source) { 
	var data = {};
	data["sourceName"] = source;
	sendObsCommand("RefreshBrowserSource", data);
}

function OBSSetCurrentProfile(name) { 
	var data = {};
	data["profile-name"] = name;
	sendObsCommand("SetCurrentProfile", data);
}

function OBSStartRecording() { 
	var data = {};
	sendObsCommand("StartRecording", data);
}

function OBSStopRecording() { 
	var data = {};
	sendObsCommand("StopRecording", data);
}

function OBSPauseRecording() { 
	var data = {};
	sendObsCommand("PauseRecording", data);
}

function OBSResumeRecording() { 
	var data = {};
	sendObsCommand("ResumeRecording", data);
}

function OBSSetCurrentSceneCollection(name) { 
	var data = {};
	data["sc-name"] = name;
	sendObsCommand("SetCurrentSceneCollection", data);
}

function OBSSetCurrentScene(name) { 
	var data = {};
	data["scene-name"] = name;
	sendObsCommand("SetCurrentScene", data);
}

function OBSSetSceneTransitionOverride(name, transitionName, transitionDuration) { 
	var data = {};
	data["scene-name"] = name;
	data["transitionName"] = transitionName;
	data["transitionDuration"] = transitionDuration;
	sendObsCommand("SetSceneTransitionOverride", data);
}

function OBSSetPreviewScene(name) { 
	var data = {};
	data["scene-name"] = name;
	sendObsCommand("SetPreviewScene", data);
}

function OBSSetCurrentTransition(name) { 
	var data = {};
	data["transition-name"] = name;
	sendObsCommand("SetCurrentTransition", data);
}

function OBSSetTransitionDuration(duration) { 
	var data = {};
	data["duration"] = duration;
	sendObsCommand("SetTransitionDuration", data);
}


