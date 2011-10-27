/*
 * Based on Speed Dial extension by Josep del Rio <josep.rio@uworks.net>
 */
var GrabThemAll_LoadListener = {
    alreadyLoaded: false,
    firstLoadTime: -1,
    currentTimeoutId: -1,
    loadFinished: false,
    captureDelay: 500,
    
    QueryInterface: function(aIID){
        if (aIID.equals(Components.interfaces.nsIDOMEventListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    },
    
    handleEvent: function(event){
        if (GrabThemAll_LoadListener.loadFinished) {
			GrabThemAll_LoadListener.resetTimer();
            return;
        }
        
        
        if ((event.type == "load") || (event.type == "pageshow")) {
            if (!GrabThemAll_LoadListener.alreadyLoaded) {
                if (event.currentTarget.contentDocument !== event.originalTarget) {
					GrabThemAll_LoadListener.resetTimer();
                    return;
                }
                GrabThemAll_LoadListener.alreadyLoaded = true;
                GrabThemAll_LoadListener.firstLoadTime = (new Date()).getTime();
            }
            GrabThemAll_LoadListener.resetTimer();
        }
        else {
            if (event.type == "unload") {
                if (event.currentTarget.contentDocument == event.originalTarget) {
                    GrabThemAll_LoadListener.alreadyLoaded = false;
                    if (GrabThemAll_LoadListener.currentTimeoutId != -1) {
                        clearTimeout(GrabThemAll_LoadListener.currentTimeoutId);
                    }
                    GrabThemAll_LoadListener.captureStarted();
                }
                else {
                    GrabThemAll_LoadListener.resetTimer();
                }
            }
            else {
                if (event.type == "DOMSubtreeModified") {
                    if (GrabThemAll_LoadListener.alreadyLoaded) {
                        GrabThemAll_LoadListener.resetTimer();
                    }
                }
            }
        }
    },
    
    resetTimer: function() {
        if (GrabThemAll_LoadListener.currentTimeoutId !== -1) {
            clearTimeout(GrabThemAll_LoadListener.currentTimeoutId);
        }
        if ((new Date()).getTime() > (GrabThemAll_LoadListener.firstLoadTime + GrabThemAll_RunDlg.timeoutTime)) {
            // Just do it
            GrabThemAll_LoadListener.captureFinished();
        }
        else {
            GrabThemAll_LoadListener.currentTimeoutId = setTimeout(GrabThemAll_LoadListener.captureFinished, GrabThemAll_LoadListener.captureDelay);
        }
    },
    
    captureStarted: function() {
        GrabThemAll_LoadListener.alreadyLoaded = false;
        GrabThemAll_LoadListener.loadFinished = false;
        GrabThemAll_LoadListener.firstLoadTime = (new Date()).getTime();
        GrabThemAll_LoadListener.currentTimeoutId = setTimeout(GrabThemAll_LoadListener.captureFinished, GrabThemAll_RunDlg.timeoutTime);
    },
    
    captureFinished: function() {
        if (GrabThemAll_LoadListener.loadFinished) {
            return;
        }
        GrabThemAll_LoadListener.loadFinished = true;
        setTimeout("GrabThemAll_LoadListener.captureFinalize();", GrabThemAll_RunDlg.timeToWait); // this allows any sort of javascript on the page a few extra seconds depending on the amount of time passed to it before the picture is taken
    },
    
    captureFinalize: function() {
        var loaderBrowser = document.getElementById('rundlg-browser');
        try {
            const ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
            var origURI = ioService.newURI(loaderBrowser.contentDocument.documentURI, loaderBrowser.contentDocument.characterSet, null);
            if (origURI.spec.substr(0, 'about:neterror'.length) === 'about:neterror') {
				throw origURI.spec;
			}
            GrabThemAll_RunDlg.doScreenShot(loaderBrowser.contentWindow, loaderBrowser.contentDocument);
        } 
        catch (err) {
            GrabThemAll_RunDlg.pageError(loaderBrowser.contentWindow, err);
        }
    }
}
