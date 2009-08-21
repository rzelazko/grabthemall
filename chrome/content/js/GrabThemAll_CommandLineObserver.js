function GrabThemAll_CommandLineObserver() {
	this.register();
}

GrabThemAll_CommandLineObserver.prototype = {
	observe : function(aSubject, aTopic, aData) {
		var cmdLine = aSubject
				.QueryInterface(Components.interfaces.nsICommandLine);
		this.urlList = cmdLine.handleFlagWithParam("url-list", false);
		this.oneUrl = cmdLine.handleFlagWithParam("one-url", false);
		this.saveToDir = cmdLine.handleFlagWithParam("save-to-dir", false);
	},

	register : function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "commandline-args-changed", false);
	},

	unregister : function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);
		try {
			observerService.removeObserver(this, "commandline-args-changed");
		} catch (e) {
			// unregistring failed
		}
	},
	
	oneUrl : '',
	urlList : '',
	saveToDir : ''
}

var grabThemAllCmdObserver = new GrabThemAll_CommandLineObserver();

// Because we haven't yet registered a CommandLineObserver when the application
// is launched the first time, we simulate a notification here.
var observerService = Components.classes["@mozilla.org/observer-service;1"]
		.getService(Components.interfaces.nsIObserverService);
observerService.notifyObservers(window.arguments[0],
		"commandline-args-changed", null);

addEventListener("unload", grabThemAllCmdObserver.unregister, false);
