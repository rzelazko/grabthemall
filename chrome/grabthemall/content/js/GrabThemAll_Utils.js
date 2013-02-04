/*
 * File based on on Screengrab! extension by Andy Mutton
 */

var GrabThemAll_Utils = {
	
	dump : function(message) {
		if (GrabThemAll_Utils.getPref('debug')) {
			var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
							.getService(Components.interfaces.nsIConsoleService);
			consoleService.logStringMessage(message);
		}
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
    	var filePath = nsIDir.path;
		if (filePath.search(/\\/) != -1) {
			filePath += '\\';
		} else {
			filePath += '/';
		}
		filePath += fileBaseName + '.' + format;
    	
		var nsFile = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsIFile);
		nsFile.initWithPath(filePath);
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
		return nsFile.exists();
    },
    
    saveTxtToFile : function(nsIDir, fileName, dataTxt) {
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
		if (!nsFile.exists()) {
			nsFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
		}
    	
    	if (nsFile != null) {
    		try	{
				var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			                         .createInstance(Components.interfaces.nsIFileOutputStream);
			
				// use 0x02 | 0x10 to open file for appending.
				foStream.init(nsFile, 0x02 | 0x08 | 0x10, 0666, 0); 
				// write, create, append
				// In a c file operation, we have no need to set file mode with or operation,
				// directly using "r" or "w" usually.
				foStream.write(dataTxt, dataTxt.length);
				foStream.close();
    		} catch (e) {
    			// alert('I can\'t write to file: ' + filePath);
    		}
    	}
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
        var writeFlag = 0x02;
        var createFlag = 0x08;
        var truncateFlag = 0x20;
        
        var fileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        fileOutputStream.init(nsFile, writeFlag | createFlag | truncateFlag, 0664, null);
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
}