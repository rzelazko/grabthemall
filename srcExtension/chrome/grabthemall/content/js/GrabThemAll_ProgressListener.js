/**
 * Currently not used (using GrabThemAll_LoadListener instead)
 */

var GrabThemAll_ProgressListener = {
	QueryInterface : function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener)
				|| aIID.equals(Components.interfaces.nsISupportsWeakReference)
				|| aIID.equals(Components.interfaces.nsISupports))
			return this;
		throw Components.results.NS_NOINTERFACE;
	},

	onStateChange : function(aWebProgress, aRequest, aFlag, aStatus) {
		if (!aWebProgress.isLoadingDocument && aFlag & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
			GrabThemAll_Utils.dump(aWebProgress.DOMWindow.location);
			try {
				var pChannel = aRequest
						.QueryInterface(Components.interfaces.nsIHttpChannel);

				if (pChannel.requestSucceeded) {
					GrabThemAll_RunDlg.doScreenShot(aWebProgress.DOMWindow,
						aWebProgress.DOMWindow.document);
				} 
				else {
					GrabThemAll_RunDlg.pageError(aWebProgress.DOMWindow, 'pChannel');
				}
			} // end of try
			catch (err) {
				GrabThemAll_RunDlg.pageError(aWebProgress.DOMWindow, err);
			}
		}
		return 0;
	},

	onLocationChange : function(aProgress, aRequest, aURI) {
		return 0;
	},

	onProgressChange : function() {
		return 0;
	},
	onStatusChange : function() {
		return 0;
	},
	onSecurityChange : function() {
		return 0;
	},
	onLinkIconAvailable : function() {
		return 0;
	}
}
