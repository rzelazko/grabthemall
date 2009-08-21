var GrabThemAll_Server = {
	init : function() {
		this.stringsBundle = document.getElementById('string-bundle');
		this.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		    .getInterface(Components.interfaces.nsIWebNavigation)
		    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		    .rootTreeItem
		    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		    .getInterface(Components.interfaces.nsIDOMWindow); 

		var setupInfo = {
			dir : null,
			urlList : [],
			timeToWait : null,
			pageTimeOut : null,
			errUrls : null
		}; // end of setupInfo

		/* check console params list */
		if (!(
				grabThemAllCmdObserver.saveToDir && grabThemAllCmdObserver.saveToDir.length > 0 &&				
				(grabThemAllCmdObserver.oneUrl && grabThemAllCmdObserver.oneUrl.length > 0 ||
				grabThemAllCmdObserver.urlList && grabThemAllCmdObserver.urlList.length > 0)
		)) {
			dump(this.stringsBundle.getString('helpMsg') + "\n");
			this.mainWindow.close();
			return;
		} // end if console params error
		
		/* check directory if exists */
		try {
			var saveToDirFile = Components.classes["@mozilla.org/file/local;1"].
		        createInstance(Components.interfaces.nsILocalFile);
			saveToDirFile.initWithPath(grabThemAllCmdObserver.saveToDir);
		}
		catch (e) {
			dump(this.stringsBundle.getString('helpMsg') + "\n");
			dump(e + "\n");
			Components.utils.reportError(e); 
			this.mainWindow.close();
			return;
		}
		
		if (!saveToDirFile || !saveToDirFile.exists() || !saveToDirFile.isDirectory() || !saveToDirFile.isReadable())
		{
			dump(this.stringsBundle.getString('helpMsg') + "\n");
			var err = this.stringsBundle.getFormattedString(
					'errDirNotExists', [grabThemAllCmdObserver.saveToDir]) + "\n";
			dump(err);
			Components.utils.reportError(err); 
			this.mainWindow.close();
			return;
		} // end dir not exists
		setupInfo.dir = saveToDirFile;

		var saveToDirInfo = document.getElementById('saveToDirInfo');
		saveToDirInfo.label = this.stringsBundle.getFormattedString(
				'saveToDirInfoMsg', [grabThemAllCmdObserver.saveToDir]);

		var foundUrls = 0;
		/* check if one-url is provided */
		if (grabThemAllCmdObserver.oneUrl && grabThemAllCmdObserver.oneUrl.length > 0)
		{
			// if one-url and url-list error: display usge
			if (grabThemAllCmdObserver.urlList && grabThemAllCmdObserver.urlList.length > 0) {
				dump(this.stringsBundle.getString('helpMsg') + "\n");
				this.mainWindow.close();
				return;
			} // end if urlList
			
			if (GrabThemAll_Utils.isUrl(grabThemAllCmdObserver.oneUrl)) {
				setupInfo.urlList.push(grabThemAllCmdObserver.oneUrl);
				foundUrls++;
			} // end if is url
		} // end if one-url
		else
		{ // if no one-url
			/* check if file exists */
			try	{
				var urlListFile = Components.classes["@mozilla.org/file/local;1"].
				        createInstance(Components.interfaces.nsILocalFile);
				urlListFile.initWithPath(grabThemAllCmdObserver.urlList);
			}
			catch (e) {
				dump(this.stringsBundle.getString('helpMsg') + "\n");
				dump(e + "\n");
				Components.utils.reportError(e); 
				this.mainWindow.close();
				return;
			}
			
			if (!urlListFile || !urlListFile.exists() || !urlListFile.isFile() || !urlListFile.isReadable())
			{
				dump(this.stringsBundle.getString('helpMsg') + "\n");
				var err = this.stringsBundle.getFormattedString(
						'errFileNotExists', [grabThemAllCmdObserver.urlList]) + "\n";
				dump(err);
				Components.utils.reportError(err); 
				this.mainWindow.close();
				return;
			} // end dir not exists
			
			/* read url list */
			var fileContent = this.readFile(urlListFile).split("\n");
	
			for (var i = 0; i < fileContent.length; i++) {
				if (GrabThemAll_Utils.isUrl(fileContent[i])) {
					setupInfo.urlList.push(fileContent[i]);
					foundUrls++;
				}
			} // end for each line push urlList
		} // end if no one-url

		/* check url list */
		if (foundUrls > 0)
		{
			var urlFileInfo = document.getElementById('urlFileInfo');
			urlFileInfo.label = this.stringsBundle.getFormattedString(
					'fileInfoMsg', [foundUrls]);
		} // end if found urls
		else
		{ // if no url found
			dump(this.stringsBundle.getString('helpMsg') + "\n");
			var err = this.stringsBundle.getString('fileInfoErrNotFound') + "\n";
			dump(err);
			Components.utils.reportError(err); 
			this.mainWindow.close();
			return;
		} // end if no url found
		
		/* run this stuff */
		var runDlg = window.openDialog(
			'chrome://grabthemall/content/GrabThemAll_RunDlg.xul',
			'runDlg', 'centerscreen,dialog,resizable=no,modal=no,innerWidth='
			+ GrabThemAll_Utils.getPref('capture.width') + ',innerHeight='
			+ (GrabThemAll_Utils.getPref('capture.height') + 50) + ',chrome',
			setupInfo).focus();
		
		/* close window */
		this.mainWindow.close();
	},
	
	readFile : function(fileToRead) {
		try {
			netscape.security.PrivilegeManager
					.enablePrivilege("UniversalXPConnect");
		} catch (e) {
			var err = this.stringsBundle.getString('errReadPermDenied') + "\n";
			dump(err);
			Components.utils.reportError(err); 
			this.mainWindow.close();
		}
		if (fileToRead.exists() == false) {
			var err = this.stringsBundle.getFormattedString('errFileNotExists',
					[fileToRead.path]) + "\n";
			dump(err);
			Components.utils.reportError(err); 
			this.mainWindow.close();
		}
		var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance(Components.interfaces.nsIFileInputStream);
		is.init(fileToRead, 0x01, 00004, null);
		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
				.createInstance(Components.interfaces.nsIScriptableInputStream);
		sis.init(is);
		return sis.read(sis.available());
	},

	stringsBundle : null,
	
	mainWindow : null
}; // end of GrabThemAll

window.addEventListener('load', function(e) {
	GrabThemAll_Server.init();
}, false);
