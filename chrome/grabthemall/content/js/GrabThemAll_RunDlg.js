var GrabThemAll_RunDlg = {
	init : function() {
		this.setupInfo = {
			dir : '',
			urlList : [],
			processingUrl : '',
			totalUrls : 0,
			timeToWait : 0,
			pageTimeOut : 0
		};
		this.report = {
			fileName : ''
		};
		if ('arguments' in window && window.arguments.length > 0) {
			this.setupInfo = window.arguments[0];
		}

		this.stringsBundle = document.getElementById('string-bundle');

		this.setupInfo.totalUrls = this.setupInfo.urlList.length;
		if (!this.setupInfo.dir || this.setupInfo.totalUrls < 1) {
			return;
		}
		
		if (GrabThemAll_Utils.getPref('debug')) {
			GrabThemAll_Utils.dump(this.setupInfo.urlList.join("\n"));
		}
		this.setupInfo.urlList.reverse();
		this.fileType = GrabThemAll_Utils.getPref('filetype');

		this.progress = document.getElementById('rundlg-progress');
		this.progressLabel = document.getElementById('rundlg-progress-label');
		this.browser = document.getElementById('rundlg-browser');
		this.dialog = document.getElementById('grabThemAll-rundlg');

		this.timeoutId = null;
		this.timeToWait = this.setupInfo.timeToWait * 1000;
		this.timeoutTime = this.setupInfo.pageTimeOut > 0 ? this.setupInfo.pageTimeOut : GrabThemAll_Utils.getPref('timeout');
		if((this.timeoutTime * 1000) < this.timeToWait) {
			this.timeoutTime = this.timeToWait + 2500;	// this was added in so that in the reporting we don't get double posting due to a time out error
		}
		else if(this.timeoutTime === 0 && this.timeToWait === 0) {
			this.timeToWait = this.setupInfo.timeToWait * 1000 + 1000;// this was added to fix the issue of nothing being done if both time outs were set to 0
		}
		else {
			this.timeoutTime = this.timeoutTime * 1000;
		}
		
		var url = this.getUrl();
		if (!url) {
			close();
		}

		this.browser.addEventListener('pageshow', GrabThemAll_LoadListener, true);
    	this.browser.addEventListener('load', GrabThemAll_LoadListener, true);
    	this.browser.addEventListener('unload', GrabThemAll_LoadListener, true);
    	this.browser.addEventListener('DOMSubtreeModified', GrabThemAll_LoadListener, true);
    	this.browser.addEventListener('DOMLinkAdded', GrabThemAll_LoadListener, true);
		
    	GrabThemAll_LoadListener.captureStarted();		
		GrabThemAll_LoadListener.alreadyLoaded = false;
    	GrabThemAll_LoadListener.loadFinished = false;	

		/* ver. 0.4 - accuracy: 40-60% - progresslistener
		this.browser
				.addProgressListener(
						GrabThemAll_ProgressListener,
						Components.interfaces.nsIWebProgressListener.NOTIFY_STATE_DOCUMENT);*/
		
		/* ver. 0.1 - accuracy: 30% - domcontentload
		this.browser.addEventListener('DOMContentLoaded', function(evt) {
			var pageDocument = evt.originalTarget;
			var pageWindow = pageDocument.defaultView;
			
			GrabThemAll_RunDlg.doScreenShot(pageWindow, pageDocument);
		}, true);*/
		
		this.browser.loadURI(url);
				
		var now = new Date();		
		this.report.fileName = '_report_' + now.format("yyyymmdd_HHMMss") + '.csv';
		if (GrabThemAll_Utils.getBoolPref('reportfile.save')) {
			GrabThemAll_Utils.saveTxtToFile(this.setupInfo.dir, this.report.fileName, 
				'"oryg url";' +
				'"browser url";' + 
				'"file name";' + 
				'"status"' + "\n");
		}
	},

	doScreenShot : function(pageWindow, pageDocument) {
		var currentUrl = pageWindow.location;
		var orygUrl = this.currentUrl();
		if (GrabThemAll_Utils.isUrl(currentUrl)) {
			var urlHash = GrabThemAll_Utils.hash(this.setupInfo.processingUrl);
			GrabThemAll_ScreenShot.doSS(pageWindow, this.setupInfo.dir, urlHash);
			if (GrabThemAll_Utils.getBoolPref('reportfile.save')) {
				GrabThemAll_Utils.saveTxtToFile(this.setupInfo.dir, this.report.fileName, 
					'"' + orygUrl + '";' +
					'"' + currentUrl + '";' +
					'"' + urlHash + (this.fileType == 0 ? '.jpeg' : '.png') + '";' +
					'"ok"' + "\n");
			}
		}
		this.nextPage();
		GrabThemAll_Utils.dump(pageWindow.location + ' [ok]');
	},

	pageError : function(pageWindow, additInfo) {
		this.nextPage(pageWindow);

		var errMsg = 'error';
		if (additInfo) {
			errMsg += ': ' + additInfo;
		}
		errMsg += '';
		GrabThemAll_Utils.dump(pageWindow.location + ' ' + errMsg);
		if (GrabThemAll_Utils.getBoolPref('reportfile.save')) {
			GrabThemAll_Utils.saveTxtToFile(this.setupInfo.dir, this.report.fileName, 
				'"' + this.currentUrl() + '";' +
				'"' + pageWindow.location + '";' +
				'"";' +
				'"' + errMsg + "\"\n");
		}
	},

	nextPage : function() {
		var nextUrl = this.getUrl();
		if (GrabThemAll_Utils.isUrl(nextUrl)) {			
	    	GrabThemAll_LoadListener.captureStarted();		
			GrabThemAll_LoadListener.alreadyLoaded = false;
	    	GrabThemAll_LoadListener.loadFinished = false;	

			this.browser.loadURI(nextUrl);
		} else {
			close();
		}
	},
	
	currentUrl : function() {
		return this.setupInfo.processingUrl;
	},

	getUrl : function() {
		if (this.timeoutId) {
			window.clearTimeout(this.timeoutId);
		}
		if (this.timeoutTime > 0) {
			var me = this;
			this.timeoutId = window.setTimeout(function() {
				if (GrabThemAll_Utils.getBoolPref('reportfile.save')) {
					GrabThemAll_Utils.saveTxtToFile(me.setupInfo.dir, me.report.fileName, 
						'"' + me.currentUrl() + '";' +
						'"' + GrabThemAll_RunDlg.browser.currentURI.spec + '";' +
						'"";' + 
						'"timeout"' +"\n");
				}
				GrabThemAll_RunDlg.browser.stop();
			}, this.timeoutTime);
		}

		var todoUrls = this.setupInfo.urlList.length;
		var doneUrls = this.setupInfo.totalUrls - todoUrls;
		if (todoUrls < 1) {
			return false;
		}

		var percent = Math.round(100 * doneUrls / this.setupInfo.totalUrls);
		this.progress.value = percent;

		this.progressLabel.label = this.stringsBundle.getFormattedString(
				'progressInfo', [doneUrls + 1, this.setupInfo.totalUrls]);
		/*
		 * FIXME this.dialog.title = this.stringsBundle.getFormattedString(
		 * 'dialogTitle', [doneUrls, this.setupInfo.totalUrls]);
		 */
		var nextUrl = this.setupInfo.urlList.pop().replace(/^\s+|\s+$/g, '');
		this.setupInfo.processingUrl = nextUrl;
		if (nextUrl.search(/^http:\/\/[a-zA-Z0-9\.\-]+$/) != -1) {
			nextUrl += '/';
		}

		var fileName = GrabThemAll_Utils.hash(nextUrl) + '.'
				+ (this.fileType == 0 ? 'jpeg' : 'png');

		if (GrabThemAll_Utils.fileExists(this.setupInfo.dir, fileName)) {
			if (GrabThemAll_Utils.getBoolPref('reportfile.save')) {
				var errMsg = 'err: file already exists';
				GrabThemAll_Utils.saveTxtToFile(this.setupInfo.dir, this.report.fileName, 
					'"' + this.currentUrl() + '";' +
					'"' + nextUrl + '";' +
					'"' + fileName + (this.fileType == 0 ? '.jpeg' : '.png') + '";' +
					'"' + errMsg + "\"\n");
			}
			nextUrl = this.getUrl();
		}

		return nextUrl;
	}
};
window.addEventListener('load', function(e) {
	GrabThemAll_RunDlg.init();
}, false);