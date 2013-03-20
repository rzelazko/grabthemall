/*
 * Based on Speed Dial extension by Josep del Rio <josep.rio@uworks.net>
 */
var GrabThemAll_LoadListener = {
    alreadyLoaded: false,
    firstLoadTime: -1,
    currentTimeoutId: -1,
    captureLock: false,
	
    QueryInterface: function(aIID) {
        if (aIID.equals(Components.interfaces.nsIDOMEventListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    },
    
    handleEvent: function(event) {
        if (event.type == 'load') {
			GrabThemAll_Utils.dump('event load', true);

            if (event.currentTarget.contentDocument === event.originalTarget) {
				GrabThemAll_Utils.dump('event load originalTarget', true);
				
	            if (!this.alreadyLoaded) {
    	            this.alreadyLoaded = true;
        	       	this.firstLoadTime = (new Date()).getTime();
					GrabThemAll_Utils.dump('event load setFirstLoadTime: ' + this.firstLoadTime, true);
	            }
				this.captureStarted();
            }
        }
    },
    
    resetTimer: function() {
		GrabThemAll_Utils.dump('event resetTimer', true);
		
		this.captureLock = false;
        if (this.currentTimeoutId !== -1) {
            clearTimeout(this.currentTimeoutId);
        }
    },
    
    captureStarted: function(force) {
		var gtaLL = this;
		
		if (this.captureLock) {
			GrabThemAll_Utils.dump('event captureStarted isLoced=true', true);
			return;
		}
		
		this.captureLock = true;

        if (force || (new Date()).getTime() > (this.firstLoadTime + GrabThemAll_RunDlg.getTimeoutTime())) {
			if (force) {
				GrabThemAll_Utils.dump('event captureStarted forced', true);
			} else {
				GrabThemAll_Utils.dump('event captureStarted firstLoadTime: ' + this.firstLoadTime + ' timeOutTime: ' + GrabThemAll_RunDlg.getTimeoutTime(), true);
			}
			
            this.captureFinished();
        }
        else {
			GrabThemAll_Utils.dump('event captureStarted setTimeout', true);			
            this.currentTimeoutId = setTimeout(function() { gtaLL.captureFinished(); }, GrabThemAll_RunDlg.getTimeToWait());
        }
		
    },
    
    captureFinished: function() {		
		GrabThemAll_Utils.dump('event captureFinished', true);
    	this.alreadyLoaded = false;
        this.resetTimer();
        this.captureFinalize();
		this.captureLock = false;
    },
    
    captureFinalize: function() {
        var loaderBrowser = document.getElementById('rundlg-browser');
        try {
			GrabThemAll_Utils.dump('event captureFinalize try', true);   
            const ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
            var origURI = ioService.newURI(loaderBrowser.contentDocument.documentURI, loaderBrowser.contentDocument.characterSet, null);
            if (origURI.spec.substr(0, 'about:neterror'.length) === 'about:neterror') {
				throw origURI.spec;
			}
            GrabThemAll_RunDlg.doScreenShot(loaderBrowser.contentWindow, loaderBrowser.contentDocument);
        } 
        catch (err) {
			GrabThemAll_Utils.dump('event captureFinalize err', true);
            GrabThemAll_RunDlg.pageError(loaderBrowser.contentWindow, err);
        }
    }
}
