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
			fileName : '',
			stream : null
		};
		if ('arguments' in window && window.arguments.length > 0) {
			this.setupInfo = window.arguments[0];
		}

		this.stringsBundle = document.getElementById('GrabThemAll_RunDlg_SB');

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

		this.timeToWait = this.setupInfo.timeToWait * 1000;
		this.timeoutTime = 1000 * (this.setupInfo.pageTimeOut > 0 ? this.setupInfo.pageTimeOut : GrabThemAll_Utils.getPref('timeout'));
		if (this.timeToWait === 0) {
			this.timeToWait = 100;
		}
		if (this.timeoutTime === 0) { 
			this.timeoutTime = 1000;
		}
		this.timeoutId = null;		
		
		var now = new Date();		
		this.report.fileName = '_report_' + GrabThemAll_DateFormat(now, "yyyymmdd_HHMMss") + '.csv';
		this.initStreams();
		this.addToReport('oryg url', 'browser url',	'file name', 'status');		
		
		GrabThemAll_Utils.dump('runDlg init ' + now + ' ' + this.setupInfo.toString());
		
    	this.browser.addEventListener('load', GrabThemAll_LoadListener, true);

		this.nextPage();				
	},
	
	getTimeoutTime : function() {
		return this.timeoutTime;
	},

	getTimeToWait : function() {
		return this.timeToWait;
	},

	doScreenShot : function(pageWindow, pageDocument) {
		var currentUrl = pageWindow.location.toString(),
			gtaRunDlg = this;
			
		GrabThemAll_Utils.dump('runDlg doScreenShot', true);
				
		gtaRunDlg.browser.stop();
			
		var orygUrl = gtaRunDlg.currentUrl();
		if (GrabThemAll_Utils.isUrl(currentUrl)) {
			var urlHash = GrabThemAll_Utils.hash(gtaRunDlg.setupInfo.processingUrl);
			GrabThemAll_ScreenShot.doSS(pageWindow, gtaRunDlg.setupInfo.dir, urlHash);
			
			GrabThemAll_Utils.dump('runDlg doScreenShot doSS', true);
			this.addToReport(orygUrl, currentUrl, urlHash + (gtaRunDlg.fileType == 0 ? '.jpeg' : '.png'), 'ok');
		}
		GrabThemAll_Utils.dump(pageWindow.location + ' [ok]');
		gtaRunDlg.nextPage();
	},

	pageError : function(pageWindow, additInfo) {
		this.browser.stop();
		this.nextPage();

		var errMsg = 'error';
		if (additInfo) {
			errMsg += ': ' + additInfo;
		}
		errMsg += '';
		GrabThemAll_Utils.dump(errMsg, true);
		this.addToReport(this.currentUrl(), null, '', errMsg);
	},

	nextPage : function() {
		var nextUrl = this.getUrl(),
			gtaRunDlg = this;
		
		this.clearTimeout();

		if (GrabThemAll_Utils.isUrl(nextUrl)) {
			GrabThemAll_Utils.dump('runDlg nextPage loadURI: ' + nextUrl, true);
			this.browser.loadURI(nextUrl);
			
			this.timeoutId = window.setTimeout(function() {
				GrabThemAll_Utils.dump('runDlg nextPage timeoutCapture (' + gtaRunDlg.timeoutTime + ')', true);
				GrabThemAll_LoadListener.resetTimer();
				GrabThemAll_LoadListener.captureStarted(true);
			}, this.timeoutTime);
		} else {
			close();
		}
	},

	clearTimeout : function () {
		if (this.timeoutId) {
			window.clearTimeout(this.timeoutId);
		}
			
	},
	
	currentUrl : function() {
		return this.setupInfo.processingUrl;
	},

	getUrl : function() {
		var me = this;			
		
		var todoUrls = this.setupInfo.urlList.length;
		var doneUrls = this.setupInfo.totalUrls - todoUrls;
		if (todoUrls < 1) {
			return false;
		}

		var percent = Math.round(100 * doneUrls / this.setupInfo.totalUrls);
		this.progress.value = percent;

		this.progressLabel.label = this.stringsBundle.getFormattedString(
				'progressInfo', [doneUrls + 1, this.setupInfo.totalUrls]);
					
		var nextUrl = this.setupInfo.urlList.pop().replace(/^\s+|\s+$/g, '');
		this.setupInfo.processingUrl = nextUrl;

		var fileName = GrabThemAll_Utils.hash(nextUrl) + '.'
				+ (this.fileType == 0 ? 'jpeg' : 'png');

		if (GrabThemAll_Utils.fileExists(this.setupInfo.dir, fileName)) {
			GrabThemAll_Utils.dump('getUrl fileExists: ' + fileName, true);
			this.addToReport(nextUrl, null, fileName, "file already exists");
			nextUrl = this.getUrl();
		}
		
		GrabThemAll_Utils.dump('getUrl: ' + nextUrl, true);
		
		return nextUrl;
	},

	initStreams : function () {
		if (!GrabThemAll_Utils.getBoolPref('reportfile.save')) {
			return;
		}
		
		var nsFile = GrabThemAll_Utils.getNSFile(this.setupInfo.dir, this.report.fileName);
    	
    	if (nsFile) {
			this.report.stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);
			this.report.stream.init(nsFile, GrabThemAll_Utils.fileFlags.writeFlag | GrabThemAll_Utils.fileFlags.createFlag, GrabThemAll_Utils.fileFlags.permFile, 0);
		} else {		
			GrabThemAll_Utils.dump('runDlg initStreams err', true);
		}
	},
	
	addToReport : function (orygUrl, browserUrl, fileName, statusInfo) {	
		if (!GrabThemAll_Utils.getBoolPref('reportfile.save')) {
			return;
		}
		
		if (browserUrl === null) {
			browserUrl = this.browser.contentWindow.location.toString();
		}

		var dataTxt = '"' + orygUrl + '";' +
			'"' + browserUrl + '";' + 
			'"' + fileName + '";' + 
			'"' + statusInfo + '"' + "\n";
		
		this.report.stream.write(dataTxt, dataTxt.length);
	},
	
	close : function () {	
		if (!GrabThemAll_Utils.getBoolPref('reportfile.save')) {
			return;
		}
		
		try {
			if (this.report.stream instanceof Components.interfaces.nsISafeOutputStream) {
				this.report.stream.finish();
			} else {
				this.report.stream.close();
			}
		} catch (e) {
			GrabThemAll_Utils.dump('runDlg close error: ' + e, true);
		}
	}
};

window.addEventListener('load', function(e) {
	GrabThemAll_RunDlg.init();
}, false);

window.addEventListener('unload', function(e) {
	GrabThemAll_RunDlg.close();
}, false);
