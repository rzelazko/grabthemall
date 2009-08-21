var GrabThemAll = {
	init : function() {
	},

	onMenuItemCommand : function(e) {		
		var setupInfo = {
			dir : null,
			urlList : null,
			timeToWait : null,
			pageTimeOut : null,
			errUrls : null
		};
		
		var setupDlg = window.openDialog(
			'chrome://grabthemall/content/GrabThemAll_SetupDlg.xul',
			'setupDlg', 'chrome,centerscreen,dialog,modal=yes,resizable=no',
			window, setupInfo).focus();
				
		if (setupInfo.dir) {
			var runDlg = window.openDialog(
				'chrome://grabthemall/content/GrabThemAll_RunDlg.xul',
				'runDlg', 'centerscreen,dialog,resizable=no,modal=no,innerWidth='
				+ GrabThemAll_Utils.getPref('capture.width') + ',innerHeight='
				+ (GrabThemAll_Utils.getPref('capture.height') + 50) + ',chrome',
				setupInfo).focus();
		}
	}
};
window.addEventListener('load', function(e) {
	GrabThemAll.init();
}, false);
