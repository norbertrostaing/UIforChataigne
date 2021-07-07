var TSSendAlive = 0;
var mixer;
var vus;

var trackNames = {
	'i.0' : "Input_1", 
	'i.1' : "Input_2", 
	'i.2' : "Input_3", 
	'i.3' : "Input_4", 
	'i.4' : "Input_5", 
	'i.5' : "Input_6", 
	'i.6' : "Input_7", 
	'i.7' : "Input_8", 
	'i.8' : "Input_9", 
	'i.9' : "Input_10", 
	'i.10' : "Input_11", 
	'i.11' : "Input_12", 
	'l.0' : "Line_In", 
	'p.0' : "Player", 
	's.0' : "Sub_1", 
	's.1' : "Sub_2", 
	's.2' : "Sub_3", 
	's.3' : "Sub_4", 
	'a.0' : "Aux_1", 
	'a.1' : "Aux_2", 
	'a.2' : "Aux_3", 
	'a.3' : "Aux_4", 
	'f.0' : "FX_1", 
	'f.1' : "FX_2", 
	'f.2' : "FX_3", 
	'f.3' : "FX_4"
};

var commandNames = {
	"mix" : ["Level", "f"],
	"gain" : ["Gain", "f"],
	"pan" : ["Pan", "f"],
	"phantom" : ["Phantom", "b"],
	"invert" : ["Invert", "b"],
	"mute" : ["Mute", "b"],
	"solo" : ["Solo", "b"],
	"mute" : ["Mute", "b"],
	"eq.hpf.freq" : ["HPF_Freq", "f"],
	"eq.b1.freq" : ["EQ_1_Freq", "f"],
	"eq.b1.gain" : ["EQ_1_Gain", "f"],
	"eq.b1.q" : ["EQ_1_Q", "f"],
	"eq.b2.freq" : ["EQ_2_Freq", "f"],
	"eq.b2.gain" : ["EQ_2_Gain", "f"],
	"eq.b2.q" : ["EQ_2_Q", "f"],
	"eq.b3.freq" : ["EQ_3_Freq", "f"],
	"eq.b3.gain" : ["EQ_3_Gain", "f"],
	"eq.b3.q" : ["EQ_3_Q", "f"],
	"eq.b4.freq" : ["EQ_4_Freq", "f"],
	"eq.b4.gain" : ["EQ_4_Gain", "f"],
	"eq.b4.q" : ["EQ_4_Q", "f"],
	"gate.thresh" : ["Gate_threshold", "f"],
	"dyn.ratio" : ["Comp_Ratio", "f"],
	"dyn.threshold" : ["Comp_Threshold", "f"],
	"dyn.attack" : ["Comp_Attack", "f"],
	"dyn.release" : ["Comp_Release", "f"],
	"dyn.outgain" : ["Comp_Out_Gain", "f"],
};

var sendAuxNames = {
	'aux.0' : "Aux_1", 
	'aux.1' : "Aux_2", 
	'aux.2' : "Aux_3", 
	'aux.3' : "Aux_4" 
};

var sendFxNames = {
	'fx.0' : "FX_1", 
	'fx.1' : "FX_2", 
	'fx.2' : "FX_3", 
	'fx.3' : "FX_4" 
};

// .aux."+(a-1)+".value
// .fx."+(f-1)+".value


function init() {
	mixer = local.addContainer("Mixer values");
	var tracks = util.getObjectProperties(trackNames);
	var commands = util.getObjectProperties(commandNames);
	for (var i = 0; i< tracks.length; i++) {
		var name = trackNames[tracks[i]];
		var container = mixer.addContainer(name);
		container.setCollapsed(true);
		var type = tracks[i].substring(0,1);
		var isInput = type == "i";
		for (var j = 0; j < commands.length; j++) {
			if (commandNames[commands[j]][1] == "f") {
				container.addFloatParameter(commandNames[commands[j]][0], "", 0, 0, 1);
			} else if (commandNames[commands[j]][1] == "b") {
				container.addBoolParameter(commandNames[commands[j]][0], "", false);
			}
		}
		if (["i", "p", "l", "f"].indexOf(type)>=0) {
		}
	}

	vus = local.addContainer("Vumeters");
	for (var i = 0; i< 12; i++) {
		vus.addFloatParameter("inGain"+(i+1), "", 0, 0, 1);
		vus.addFloatParameter("inVol"+(i+1), "", 0, 0, 1);
	}
}

function wsMessageReceived(data) {
	data = data.split("\n");

	for (var i = 0; i< data.length; i++) {
		if (data[i].substring(0,7) === "3:::RTA") {} 
		else if (data[i].substring(0,3) === "2::") {}
		else if (data[i].substring(0,4) === "VU2^") {
			var vu = data[i].substring(4,data[i].length);
			vu = util.fromBase64Bytes(vu);

			var test = "";
			// 1 : gain
			// 3 : lvl
			var track = 0;
			for (var i = 8; i< vu.length && track < 12; i = i+6) {
				script.log(track);
				var vuIn = vu[i] * 0.004167508166392142;
				var vuOut = vu[i+2] * 0.004167508166392142;
				vus.getChild("inGain"+(track+1)).set(vuIn);
				vus.getChild("inVol"+(track+1)).set(vuOut);
				track = track + 1;
			}
		}
		else if (data[i].substring(0,4) === "SETD") {
			parseCommand(data[i]);
		} else if (data[i].substring(0,8) === "3:::SETD") {
			parseCommand(data[i]);
		} 
		else {
			script.log(data[i].substring(0,8));
		}
	}

	return; 

	// if (data.length == 445) {
	// 	return;
	// 	data = data.split("\n");
	// 	data = data[1];
	// 	data = data.substring(4, data.length-4);
	// 	var test = " : ";
	// 	script.log("!!");

	// 	for (var i = 1; i< 14; i++) {
	// 		var v = b64toVal(data.charAt(9+i));
	// 		test += v+"\t";
	// 		root.customVariables.group.variables.getChild("test"+i).getChild("test"+i).set(v);
	// 	}
	// 	script.log(test);
	// 	for (var i = 0; i< 1; i++) {
	// 		var n = 8 + (i*8);
	// 		var inLevel = (b64toVal(data.charAt(n))*64)+b64toVal(data.charAt(n+1));
	// 		var outLevel = (b64toVal(data.charAt(n+6))*64)+b64toVal(data.charAt(n+7));
	// 		inLevel = inLevel/255;
	// 		outLevel = outLevel/255;
	// 		script.log("gain "+(i+1)+" : "+inLevel);
	// 		script.log("out "+(i+1)+" : "+outLevel);
	// 		// script.log("reste : "+b64toVal(data.charAt(n+2))+" "+b64toVal(data.charAt(n+3))+" "+b64toVal(data.charAt(n+4))+" "+b64toVal(data.charAt(n+5))+" ");
	// 	}
	// } 

}

function parseCommand(c) {
	c = c.split("^");
	if (c.length == 3 && (c[0] == "3:::SETD" || c[0] == "SETD")) {
		var value = parseFloat(c[2]);
		var data = c[1].split(".");
		var target = data[0]+"."+data[1];
		data = data.splice(2);
		var action = data.join('.');
		if (!trackNames[target]) {return;  }
		if (commandNames[action]) {
			local.getChild("mixerValues").getChild(trackNames[target]).getChild(commandNames[action][0]).set(value);
		} else {
			script.log(action);
		}
	}
}


function moduleParameterChanged(param)
{
	if (param.isParameter()) {
		script.log("Module parameter changed : "+param.name+" > "+param.get());
		if (param.name == "uiIP") {
			local.parameters.serverPath.set(param.get()+"/socket.io/1/websocket/10354264313884423222");
		}
	} else {
		script.log("Module parameter triggered : "+param.name);	
	}
}

function update(deltaTime) {
	var now = util.getTime();
	if (now > TSSendAlive) {
		TSSendAlive = now + 2;
		keepAlive();
	}
}

function keepAlive() {
	local.send("3:::ALIVE");
}

function channelLevel(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".mix^"+val); 
}

function channelMute(c, val) {
	val = val ? 1 : 0;
	sendCommand("3:::SETD^i."+(c-1)+".mute^"+val); 
}

function channelPan(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".pan^"+val); 
}

function channelGain(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".gain^"+val); 
}

function channelAuxSend(c, a, val) {
	sendCommand("3:::SETD^i."+(c-1)+".aux."+(a-1)+".value^"+val); 
}

function channelFxSend(c, f, val) {
	sendCommand("3:::SETD^i."+(c-1)+".fx."+(f-1)+".value^"+val); 
}

function lineInLevel(val) {
	sendCommand("3:::SETD^l.0.mix^"+val); 
	sendCommand("3:::SETD^l.1.mix^"+val); 
}

function playerLevel(val) {
	sendCommand("3:::SETD^p.0.mix^"+val); 
	sendCommand("3:::SETD^p.1.mix^"+val); 
}

function fxLevel(f, val) {
	sendCommand("3:::SETD^f."+(f-1)+".mix^"+val); 
}

function subLevel(s, val) {
	sendCommand("3:::SETD^s."+(s-1)+".mix^"+val);
}

function auxLevel(a, val) {
	sendCommand("3:::SETD^a."+(a-1)+".mix^"+val);
}
	
function channelPhantom(c, val) {
	val = val ? 1 : 0;
	sendCommand("3:::SETD^i."+(c-1)+".phantom^"+val);
}

function channelInvertPhase(c, val) {
	val = val ? 1 : 0;
	sendCommand("3:::SETD^i."+(c-1)+".invert^"+val);
}

function channelSolo(c, val) {
	val = val ? 1 : 0;
	sendCommand("3:::SETD^i."+(c-1)+".solo^"+val); 
}

function lineInAuxSend(a, val) {
	sendCommand("3:::SETD^l.0.aux."+(a-1)+".value^"+val); // 0.33809031796959366
	sendCommand("3:::SETD^l.1.aux."+(a-1)+".value^"+val); // 0.33809031796959366
}

function playerAuxSend(a, val) {
	sendCommand("3:::SETD^p.0.aux."+(a-1)+".value^"+val); // 0.33809031796959366
	sendCommand("3:::SETD^p.1.aux."+(a-1)+".value^"+val); // 0.33809031796959366
}

function fxAuxSend(f, a, val) {
	sendCommand("3:::SETD^f."+(f-1)+".aux."+(a-1)+".value^"+val); 
}

function channelAuxMute(c, val) {
	val = val ? 1 : 0;
	sendCommand("3:::SETD^i."+(c-1)+".mute^"+val); 
}

function channelHPF(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".eq.hpf.freq^"+val); 
}

function channelEqFreq(c, band, val) {
	sendCommand("3:::SETD^i."+(c-1)+".eq.b"+(band)+".freq^"+val); 
}

function channelEqGain(c, band, val) {
	sendCommand("3:::SETD^i."+(c-1)+".eq.b"+(band)+".gain^"+val); 
}

function channelEqQ(c, band, val) {
	sendCommand("3:::SETD^i."+(c-1)+".eq.b"+(band)+".q^"+val); 
}

function channelGateThreshold(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".gate.thresh^"+val); 
}

function channelCompRatio(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".dyn.ratio^"+val); 
}

function channelCompThreshold(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".dyn.threshold^"+val);
}

function channelCompAttack(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".dyn.attack^"+val);
}

function channelCompRelease(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".dyn.release^"+val);
}

function channelCompGain(c, val) {
	sendCommand("3:::SETD^i."+(c-1)+".dyn.outgain^"+val);
}

var targetCommands = {
	"channel" : "i", 
	"linein" : "l",
	"player" : "p",
	"sub" : "s",
	"aux" : "a",
	"fx" : "f"
};

var valueCommands = { // "command", ["allowedTargets"]
	"level" :["mix", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"mute" :["mute", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"pan" :["pan", ["channel", "sub", "aux", "fx"]],
	"gain" :["gain", ["channel"]],
	"phantom" :["phantom", ["channel"]],
	"invert" :["invert", ["channel"]],
	"solo" :["solo", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"mute" :["mute", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"hpf.freq" :["eq.hpf.freq", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq1.freq" :["eq.b1.freq", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq1.gain" :["eq.b1.gain", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq1.q" :["eq.b1.q", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq2.freq" :["eq.b2.freq", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq2.gain" :["eq.b2.gain", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq2.q" :["eq.b2.q", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq3.freq" :["eq.b3.freq", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq3.gain" :["eq.b3.gain", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq3.q" :["eq.b3.q", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq4.freq" :["eq.b4.freq", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq4.gain" :["eq.b4.gain", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"eq4.q" :["eq.b4.q", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"gate.thresh" :["gate.thresh", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"dyn.ratio" :["dyn.ratio", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"dyn.threshold" :["dyn.threshold", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"dyn.attack" :["dyn.attack", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"dyn.release" :["dyn.release", ["channel", "linein", "player", "sub", "aux", "fx"]],
	"dyn.outgain" :["dyn.outgain", ["channel", "linein", "player", "sub", "aux", "fx"]]
};

var booleanCommands = ["mute", "phantom", "invert", "solo", "mute"];

function setVal(targetType, targetId, valType, value) {
	if (!targetCommands[targetType]) {script.logError(targetType+' is not a valid target type'); return;}
	if (!valueCommands[valType]) {script.logError(valType+' is not a valid value type'); return;}

	var command = valueCommands[valType][0];
	var allowed = valueCommands[valType][1];
	if (allowed.indexOf(targetType) == -1) {script.logError(targetType+' and '+valType+' are not compatible'); return;}

	if (booleanCommands.indexOf(command) >= 0) {
		if (value > 0) {value = Math.round(value); }
		else { value = value ? 1 : 0; }
	}

	if (targetType == "linein" || targetType == "player" ) {
		sendCommand("3:::SETD^"+targetCommands[targetType]+".0."+command+"^"+value); 
		sendCommand("3:::SETD^"+targetCommands[targetType]+".1."+command+"^"+value); 
	} else {
		sendCommand("3:::SETD^"+targetCommands[targetType]+"."+(targetId-1)+"."+command+"^"+value); 
	}

}

var sendFromCommands = {
	"channel" : "i", 
	"linein" : "l",
	"player" : "p",
	"fx" : "f"
};

var sendToCommands = {
	"aux" : "aux",
	"fx" : "fx"
};


function setSend(fromType, fromId, toType, toId, value) {
	if (!targetCommands[fromType]) {script.logError(targetType+' is not a valid send from type'); return;}
	if (!sendToCommands[toType]) {script.logError(toType+' is not a valid sent to type'); return;}

	if (fromType == 'fx' && toType == 'fx') {script.logError("you can't send FX in FX"); return;}

	if (targetType == "linein" || targetType == "player" ) {
		sendCommand("3:::SETD^"+sendFromCommands[fromType]+".0."+sendToCommands[toType]+"."+(toId-1)+".value^"+value); 
		sendCommand("3:::SETD^"+sendFromCommands[fromType]+".1."+sendToCommands[toType]+"."+(toId-1)+".value^"+value); 
	} else {
		sendCommand("3:::SETD^"+sendFromCommands[fromType]+"."+(fromId-1)+"."+sendToCommands[toType]+"."+(toId-1)+".value^"+value); 
		script.log("3:::SETD^"+sendFromCommands[fromType]+"."+(fromId-1)+"."+sendToCommands[toType]+"."+(toId-1)+".value^"+value); 
	}

}


function sendCommand(cmd) {
	local.send(cmd);
	parseCommand(cmd);
}



