var GrabThemAll_SetupDlg = {
	onLoad : function() {
		this.file = null;
		this.dir = null;
		var timeToWait = null;
		var pageTimeOut = null;

		this.urlArray = [];
		this.stringsBundle = document.getElementById('string-bundle');
		this.grabThemAllDlg = document.getElementById('grabThemAllSetup');

		this.browser = null;
		if ('arguments' in window && window.arguments.length >= 1) {
			this.browser = window.arguments[0];
		}

		this.initialized = true;
	},
	selectFile : function(e) {
		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes['@mozilla.org/filepicker;1']
				.createInstance(nsIFilePicker);
		fp.init(window, this.stringsBundle.getString('openFileDialogTitle'),
				nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterText);
		fp.appendFilter(this.stringsBundle.getString('csvFilesTitle'), '*.csv');

		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
			this.file = fp.file;
			var path = fp.file.path;

			var fileContent = this.readFile().split("\n");
			var foundUrls = 0;

			for (var i = 0; i < fileContent.length; i++) {
				if (GrabThemAll_Utils.isUrl(fileContent[i])) {
					this.urlArray.push(fileContent[i]);
					foundUrls++;
				}
			}

			var urlFileInfo = document.getElementById('urlFileInfo');
			urlFileInfo.value = this.stringsBundle.getFormattedString(
					'fileInfoMsg', [foundUrls]);

			this.checkAcceptState();
		}
	},
	selectDir : function(e) {
		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes['@mozilla.org/filepicker;1']
				.createInstance(nsIFilePicker);
		fp.init(window, this.stringsBundle.getString('openDirDialogTitle'),
				nsIFilePicker.modeGetFolder);

		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
			this.dir = fp.file;
			var path = fp.file.path;

			var docInfoLabel = document.getElementById('destDirInfo');
			docInfoLabel.value = path;

			this.checkAcceptState();
		}

	},
	run : function(e) {
		var setupInfo = window.arguments[1];
		if (this.checkAcceptState()) {
			setupInfo.dir = this.dir;
			if (setupInfo.urlList) {				
				this.urlArray.concat(setupInfo.urlList);
			}
			setupInfo.urlList = this.urlArray;
			var timeToWait = ((document.getElementById('timeToWait').value.length>0) ? document.getElementById('timeToWait').value : GrabThemAll_Utils.getPref('timeToWait'));
			var pageTimeOut = ((document.getElementById('pageTimeOut').value.length>0) ? document.getElementById('pageTimeOut').value : GrabThemAll_Utils.getPref('timeout'));
			setupInfo.timeToWait = timeToWait;
			setupInfo.pageTimeOut = pageTimeOut;

		}
		else {
			setupInfo.dir = '';
			setupInfo.urlList = [];
		}
	},
	
	checkAcceptState : function() {
		if (this.dir && this.file && this.urlArray.length > 0) {
			this.grabThemAllDlg.getButton('accept').disabled = false;
			return true;
		}
		return false;
	},

	readFile : function() {
		if (this.file.exists() == false) {
			alert(this.stringsBundle.getFormattedString('errFileNotExists',
					[this.file.path]));
		}
		var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance(Components.interfaces.nsIFileInputStream);
		is.init(this.file, 0x01, 00004, null);
		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
				.createInstance(Components.interfaces.nsIScriptableInputStream);
		sis.init(is);
		return sis.read(sis.available());
	}
};
window.addEventListener('load', function(e) {
	GrabThemAll_SetupDlg.onLoad(e);
}, false);
