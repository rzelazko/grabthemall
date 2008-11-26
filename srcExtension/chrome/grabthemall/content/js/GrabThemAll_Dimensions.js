/*
 * File based on on Screengrab! extension by Andy Mutton
 */

var GrabThemAll_Dimensions = {

	Box : function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	},

	FrameDimensions : function() {
		this.frame = GrabThemAll_ScreenShot.windowToShot;
		this.doc = this.frame.document;
		this.viewport = new GrabThemAll_Dimensions.BrowserViewportDimensions()
	},

	BrowserWindowDimensions : function() {
	},

	BrowserViewportDimensions : function() {
	}
}

GrabThemAll_Dimensions.Box.prototype = {

	getX : function() {
		return this.x;
	},

	getY : function() {
		return this.y;
	},

	getWidth : function() {
		return this.width;
	},

	getHeight : function() {
		return this.height;
	}
}

GrabThemAll_Dimensions.BrowserWindowDimensions.prototype = {
	getScreenX : function() {
		return GrabThemAll_ScreenShot.windowToShot.screenX
				+ window.screen.availLeft;
	},

	getScreenY : function() {
		return GrabThemAll_ScreenShot.windowToShot.screenY
				+ window.screen.availTop;
	},

	getWidth : function() {
		return GrabThemAll_ScreenShot.windowToShot.outerWidth
				+ window.screen.availLeft;
	},

	getHeight : function() {
		return GrabThemAll_ScreenShot.windowToShot.outerHeight
				+ window.screen.availTop;
	},

	getHeightIgnoringExternalities : function() {
		return GrabThemAll_ScreenShot.windowToShot.outerHeight;
	}
}

GrabThemAll_Dimensions.BrowserViewportDimensions.prototype = {
	getWindow : function() {
		return GrabThemAll_ScreenShot.windowToShot;
	},

	getBrowser : function() {
		return GrabThemAll_ScreenShot.windowToShot.getElementById("content").selectedBrowser;
	},

	getScreenX : function() {
		return this.getBrowser().boxObject.screenX;
	},

	getScreenY : function() {
		return this.getBrowser().boxObject.screenY;
	},

	getScrollX : function() {
		return this.getWindow().content.scrollX;
	},

	getScrollY : function() {
		return this.getWindow().content.scrollY;
	},

	getHeight : function() {
		var height = 0;
		if (this.getWindow().content.document.compatMode == "CSS1Compat") {
			// standards mode
			height = this.getWindow().content.document.documentElement.clientHeight;
		} else { // if (compatMode == "BackCompat")
			// quirks mode
			height = this.getWindow().content.document.body.clientHeight;
		}
		return height;
	},

	getWidth : function() {
		if (this.getWindow().content.document.compatMode == "CSS1Compat") {
			// standards mode
			return this.getWindow().content.document.documentElement.clientWidth;
		} else { // if (compatMode == "BackCompat")
			// quirks mode
			return this.getWindow().content.document.body.clientWidth;
		}
	}
}

GrabThemAll_Dimensions.FrameDimensions.prototype = {
	getWindow : function() {
		return this.frame;
	},

	getFrameHeight : function() {
		if (this.doc.compatMode == "CSS1Compat") {
			// standards mode
			return this.doc.documentElement.clientHeight;
		} else {
			// quirks mode
			return this.doc.body.clientHeight;
		}
	},

	getFrameWidth : function() {
		if (this.doc.compatMode == "CSS1Compat") {
			// standards mode
			return this.doc.documentElement.clientWidth;
		} else {
			// quirks mode
			return this.doc.body.clientWidth;
		}
	},

	getDocumentHeight : function() {
		return this.doc.documentElement.scrollHeight;
	},

	getDocumentWidth : function() {
		if (this.doc.compatMode == "CSS1Compat") {
			// standards mode
			return this.doc.documentElement.scrollWidth;
		} else {
			// quirks mode
			return this.doc.body.scrollWidth;
		}
	},

	getScreenX : function() {
		var offsetFromOrigin = 0;
		if (this.frame.frameElement) {
			offsetFromOrigin = this.frame.frameElement.offsetLeft;
		}
		return this.viewport.getScreenX() + offsetFromOrigin;
	},

	getScreenY : function() {
		var offsetFromOrigin = 0;
		if (this.frame.frameElement) {
			offsetFromOrigin = this.frame.frameElement.offsetTop;
		}
		return this.viewport.getScreenY() + offsetFromOrigin;
	}
}