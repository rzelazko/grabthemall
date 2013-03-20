/*
 * File based on on Screengrab! extension by Andy Mutton
 */

var GrabThemAll_Utils = {
	fileFlags : {
		permFile: parseInt("0600", 8),		
        writeFlag: 0x02,
        createFlag: 0x08,
        truncateFlag: 0x20
	},
		
	init : function () {
		/** 
		 * if dump is set there will be full trace in %temp%\grabThemAll_yyyymmdd_HHMMss.log file
		 */
		if (!GrabThemAll_Utils.getPref('debug')) {
			return;
		}
		
		var file = Components.classes["@mozilla.org/file/directory_service;1"].
					getService(Components.interfaces.nsIProperties).
					get("TmpD", Components.interfaces.nsIFile);
		file.append("grabThemAll_" + GrabThemAll_DateFormat(new Date(), "yyyymmdd_HHMMss") + ".log");
		
		Components.utils.import("resource://gre/modules/FileUtils.jsm");
		this.dumpStream = FileUtils.openSafeFileOutputStream(file, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_APPEND);
	},	
	
	close : function () {
		if (!GrabThemAll_Utils.getPref('debug')) {
			return;
		}
		
		try {
			if (this.dumpStream instanceof Components.interfaces.nsISafeOutputStream) {
				this.dumpStream.finish();
			} else {
				this.dumpStream.close();
			}
		} catch (e) {
		}
	},
	
	dump : function(message, browserUrlSuffix) {
		if (!GrabThemAll_Utils.getPref('debug')) {
			return;
		}
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
								.getService(Components.interfaces.nsIConsoleService);
		if (browserUrlSuffix) {
			message = '<' + document.getElementById('rundlg-browser').contentWindow.location.toString() + '> ' + message;
		}
		consoleService.logStringMessage(message);	
		
		message += "\n";				
		this.dumpStream.write(message, message.length);
	},

	getPref : function(name) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch('extensions.grabthemall.');
		return prefs.getIntPref(name);
	},
	
	getBoolPref : function(name) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch('extensions.grabthemall.');
		return prefs.getBoolPref(name);
	},
    
    saveScreenToFile : function(nsIDir, fileBaseName, dataUrl, format) {    	
		var nsFile = this.getNSFile(nsIDir, fileBaseName + '.' + format);
		
		if (!nsFile.exists()) {
			nsFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
		} else {
			return;
		}
		
        if (nsFile != null) {
            var binaryInputStream = GrabThemAll_Utils.dataUrlToBinaryInputStream(dataUrl);
            var fileOutputStream = GrabThemAll_Utils.newFileOutputStream(nsFile);
            GrabThemAll_Utils.writeBinaryInputStreamToFileOutputStream(binaryInputStream, fileOutputStream);
            fileOutputStream.close();
        } 
    },
    
    fileExists : function(nsIDir, fileName) {    	
		var nsFile = this.getNSFile(nsIDir, fileName);
		
		return nsFile.exists();
    },
    
    saveTxtToFile : function(nsIDir, fileName, dataTxt) {    	
    	var nsFile = this.getNSFile(nsIDir, fileName);
    	
    	if (nsFile) {
			var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(nsFile, GrabThemAll_Utils.fileFlags.writeFlag | GrabThemAll_Utils.fileFlags.createFlag, GrabThemAll_Utils.fileFlags.permFile, 0);
			
			try {
				stream.write(dataTxt, dataTxt.length);
				if (stream instanceof Components.interfaces.nsISafeOutputStream) {
					stream.finish();
				} else {
					stream.close();
				}
			} catch (e) {
    			GrabThemAll_Utils.dump('saveTxtToFile error: ' + e, true);
    		}
    	}
    },
	
	getNSFile : function(nsIDir, fileName) {
    	var filePath = nsIDir.path;
		if (filePath.search(/\\/) != -1) {
			filePath += '\\';
		} else {
			filePath += '/';
		}
    	filePath += fileName;
    	
    	var nsFile = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsIFile);
		nsFile.initWithPath(filePath);
		
		return nsFile;
	},

	isUrl : function(url) {
		if (!url) {
			return false;
		}
		var regUrl = /^http[s]?:\/\//i;
		return regUrl.test(url);
	},
    
    dataUrlToBinaryInputStream : function(dataUrl) {
        var nsIoService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var channel = nsIoService.newChannelFromURI(nsIoService.newURI(dataUrl, null, null));
        
        var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
        binaryInputStream.setInputStream(channel.open());
        return binaryInputStream;
    },
    
    newFileOutputStream : function(nsFile) {        
        var fileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        fileOutputStream.init(nsFile, GrabThemAll_Utils.fileFlags.writeFlag | GrabThemAll_Utils.fileFlags.createFlag | GrabThemAll_Utils.fileFlags.truncateFlag, GrabThemAll_Utils.fileFlags.permFile, null);
        return fileOutputStream;
    },
    
    writeBinaryInputStreamToFileOutputStream : function(binaryInputStream, fileOutputStream) {
        var numBytes = binaryInputStream.available();
        var bytes = binaryInputStream.readBytes(numBytes);
        
        fileOutputStream.write(bytes, numBytes);
    },
    
    prepareContext : function(canvas, box) {
        var context = canvas.getContext('2d');
        context.clearRect(box.getX(), box.getY(), box.getWidth(), box.getHeight());
        context.save();
        return context;
    },
    
    prepareCanvas : function(width, height) {
        var styleWidth = width + 'px';
        var styleHeight = height + 'px';
        
        var grabCanvas = document.getElementById('grabthemall_buffer_canvas');
        grabCanvas.width = width;
        grabCanvas.style.width = styleWidth;
        grabCanvas.style.maxWidth = styleWidth;
        grabCanvas.height = height;
        grabCanvas.style.height = styleHeight;
        grabCanvas.style.maxHeight = styleHeight;
    
        return grabCanvas;
    },
    
	hash : function(string) {
		if (GrabThemAll_Utils.getPref('capture.fileName') > 0) {
			return window.btoa(string)
				.replace('+', '-', 'gi')
				.replace('/', '_', 'gi')
				.replace('=', ',', 'gi');
		}
		return string.replace(/[^a-zA-Z0-9_\-\.\,]+/mig, '_');	
	}
};

window.addEventListener('load', function(e) {
	GrabThemAll_Utils.init();
}, false);


window.addEventListener('unload', function(e) {
	GrabThemAll_Utils.close();
}, false);
